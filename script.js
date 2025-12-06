function creatPage() {
    const result = document.getElementById('result');
    const paragraphe = document.createElement('p');
    paragraphe.textContent = 'Loading...'

    result.appendChild(paragraphe)
}

check = document.querySelector('#check');
check.addEventListener('click', function () {

    creatPage();




});


