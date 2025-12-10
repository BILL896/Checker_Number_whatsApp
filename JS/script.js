(function () {
    // Sélecteur multiple : retourne le premier élément trouvé parmi les sélecteurs donnés
    const phoneInput = $('#phoneNumbers');
    const checkBtn = $('#check-button');
    const btnOpen = $('.open-button');
    const btnCopy = $('.copy-button');
    const resultDiv = $('#results');

    function $(...selectors) {
        for (const s of selectors) {
            const el = document.querySelector(s);
            if (el) return el;
        }
        return null;
    }

    // creation d'apparition des boutons open et copy
    function showActionButtons() {
        // Choisir un conteneur pour ajouter les boutons d'action (préférer le parent de l'entrée si disponible)
        const container = (checkBtn && checkBtn.parentNode) ? checkBtn.parentNode : document.body;

        // Si les boutons existent déjà, les supprimer pour recréer à neuf
        const existingOpen = document.querySelector('.open-button');
        if (existingOpen) existingOpen.remove();
        const existingCopy = document.querySelector('.copy-button');
        if (existingCopy) existingCopy.remove();

        // creation de bouton Ouvrir WhatsApp
        const newOpen = document.createElement('button');
        newOpen.className = 'open-button action-button';
        newOpen.textContent = 'Ouvrir WhatsApp';
        newOpen.addEventListener('click', handleOpen);
        container.appendChild(newOpen);

        // creation de bouton copier
        const newCopy = document.createElement('button');
        newCopy.className = 'copy-button action-button';
        newCopy.textContent = 'Copier le lien';
        newCopy.addEventListener('click', handleCopy);
        container.appendChild(newCopy);
    }

    // Creation de Spinner
    let spinnerEl = null;
    function createSpinner() {
        if (spinnerEl) return;
        // Créer l'élément spinner avec le tag div
        spinnerEl = document.createElement('div');
        spinnerEl.className = 'wa-spinner-overlay';
        spinnerEl.innerHTML = `<div class="wa-spinner text-center" aria-hidden="true"></div>`;
        document.body.appendChild(spinnerEl);
    }
    // Afficher le spinner
    function showSpinner() {
        createSpinner();
        const spinnerElShow = spinnerEl.classList.add('show');
        requestAnimationFrame(() => spinnerElShow);
    }
    // Cacher le spinner
    function hideSpinner() {
        if (!spinnerEl) return;
        spinnerEl.classList.remove('show');
    }

    // Normalise : supprime espaces, parenthèses, tirets; garde les chiffres et un + initial ds le champ input
    function normalizeNumber(raw) {
        if (!raw) return '';
        raw = raw.trim();
        // Remplace les zéros en début selon besoin...Ici on garde tel quel sauf les caractères non numériques sauf +
        const keepPlus = raw.startsWith('+'); // garde le + initial si présent
        const digits = raw.replace(/[^\d]/g, ''); // garde uniquement les chiffres
        return (keepPlus ? '+' : '') + digits; // reconstitue le numéro normalisé
    }

    // Validation basique : entre 11 et 14 chiffres (+ ou 00 optionnel)
    function isValidPhone(normalized) {
        if (!normalized) return false;
        if (normalized.startsWith('+')) { // avec +
            return /^\+\d{11,14}$/.test(normalized); // entre 11 et 14 chiffres après le +
        }
        return /^\d{11,14}$/.test(normalized); // entre 11 et 14 chiffres sans +
    }

    // construit lien wa.me (sans +) et encodage du message optionnel
    function buildWaLink(normalized, text) {
        const phoneDigits = normalized.replace(/^\+/, '');
        const base = 'https://api.whatsapp.com/send/?phone=' + phoneDigits + '&text&type=phone_number&app_absent=0';
        if (!text) return base;
        return base + '?text=' + encodeURIComponent(text);
    }
    // Affiche le résultat dans la div
    function showResult(msg, isError) {
        if (!resultDiv) {
            // fallback : alert
            if (isError) alert('Erreur: ' + msg);
            else alert(msg);
            return;
        }
        // Nettoie le contenu précédent
        while (resultDiv.firstChild) {
            resultDiv.removeChild(resultDiv.firstChild);
        }
        monStyle = {
            textContent: msg,
            color: 'crimson',
            fontWeight: 'bold',
            textAlign: 'center',
            borderRadius: '20px',
            border: '1px solid crimson',
            padding: '10px'
        }
        Object.assign(resultDiv.style, monStyle);
        resultDiv.className = 'result-item';
        // Ajoute une icone avant le message (FontAwesome si dispo, sinon emoji de fallback)
        const icon = document.createElement('span');
        icon.className = isError ? 'result-icon fa fa-times-circle' : 'result-icon fa fa-check-circle';
        icon.style.marginRight = '8px';
        icon.style.fontSize = '1.1em';
        icon.setAttribute('aria-hidden', 'true');
        resultDiv.appendChild(icon);

        const textSpan = document.createElement('span');
        textSpan.textContent = msg;
        resultDiv.appendChild(textSpan);
        if (!isError) {
            icon.className = 'result-icon fa fa-check-circle';
            resultDiv.style.color = 'green';
            resultDiv.style.border = '1px solid green';
        }
    }
    // Sauvegarde du dernier numéro dans localStorage
    function saveLastNumber(normalized) {
        try {
            localStorage.setItem('lastWhatsAppNumber', normalized);
        } catch (e) { }
    }
    // Chargement du dernier numéro enregistré dans localStorage, retourne chaîne vide si absent dans le champ input
    function loadLastNumber() {
        try {
            return localStorage.getItem('lastWhatsAppNumber') || '';
        } catch (e) {
            return '';
        }
    }

    // fonction de lancement du bouton de verification 
    async function handleCheck() {
        // Affiche le spinner pendant la vérification
        showSpinner();
        // petit délai pour que le spinner soit rendu avant le traitement synchrone
        setTimeout(() => {
            const raw = phoneInput.value || '';
            const normalized = normalizeNumber(raw);
            if (!isValidPhone(normalized)) {
                hideSpinner();
                showResult(`Numéro ${normalized} est invalide. Veuillez vérifier et réessayer.`, true);
                return;
            }
            // fonction cache le spinner après validation
            hideSpinner();
            // fonction qui affiche les boutons open et copy après validation
            showActionButtons();
            showResult(`Numéro ${normalized} est valide.`, false);
            //  fontion qui sauvegarde le numéro dans le localStorage après validation
            saveLastNumber(normalized);
        }, 3000);
    }
    // fonction de lancement du bouton ouvrir whatsapp
    function handleOpen() {
        // Affiche le spinner pendant l'ouverture
        showSpinner();
        // petit délai pour que le spinner soit rendu avant le traitement synchrone
        setTimeout(() => {
            const raw = phoneInput.value || '';
            const normalized = normalizeNumber(raw);
            if (!isValidPhone(normalized)) {
                // erreur si numéro invalide
                showResult(`Numéro ${normalized} est invalide. Impossible d\'ouvrir WhatsApp.`, true);
                // cacher le spinner après l'erreur
                hideSpinner();
                return;
            }
            const text = ''; // optionnel : récupérer un message depuis un champ si besoin
            const url = buildWaLink(normalized, text); // construit le lien wa.me (sans +) et encode le message optionnel
            window.open(url, '_blank'); // ouvre dans un nouvel onglet
            // cacher le spinner après l'ouverture
            hideSpinner();
        }, 300);
    }
    // Copie le lien dans le presse-papiers
    async function handleCopy() {
        // Affiche le spinner pendant la copie
        showSpinner();
        const raw = phoneInput.value || '';
        const normalized = normalizeNumber(raw);
        if (!isValidPhone(normalized)) {
            // erreur si numéro invalide
            showResult(`Numéro ${normalized} est invalide. Rien à copier.`, true);
            hideSpinner(); // cacher le spinner après l'erreur
            return;
        }
        const link = buildWaLink(normalized);
        try {
            // tentative de copie via l'API Clipboard
            await navigator.clipboard.writeText(link);
            showResult(`Lien WhatsApp copié : ${link}`, false);
            hideSpinner(); // cacher le spinner après la copie
        } catch (err) {
            showResult('Échec de la copie dans le presse-papiers.', true);

        }
        hideSpinner(); // cacher le spinner après la tentative de copie
    }

    // Initialisation : attacher listeners si les boutons existent
    document.addEventListener('DOMContentLoaded', () => {

        const last = loadLastNumber();
        if (last && phoneInput && !phoneInput.value) phoneInput.value = last;// préremplir le champ si un numéro est sauvegardé

        if (checkBtn) checkBtn.addEventListener('click', handleCheck); // Bouton de vérification
        if (btnOpen) btnOpen.addEventListener('click', handleOpen); // Bouton d'ouverture WhatsApp
        if (btnCopy) btnCopy.addEventListener('click', handleCopy); // Bouton de copie du lien

        // Entrer dans le champ déclenche la vérification
        if (phoneInput) {
            phoneInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCheck(); // Appel de la fonction de vérification
                }
            });
        }
    });
})();