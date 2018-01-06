function getList(callback) {
    chrome.storage.local.get('jav', (owned) => {
        callback(owned.jav);
    });
}

function highlight(owned) {
    const videothumblistDom = document.getElementsByClassName('videothumblist')[0];
    const movieDoms = videothumblistDom.getElementsByClassName('video');
    for (var i = owned.length - 1; i >= 0; i--) {
        for (var j = movieDoms.length - 1; j >= 0; j--) {
            const id = movieDoms[j].getElementsByClassName('id')[0].textContent;
            if (owned[i].id === id) {
                movieDoms[j].style.backgroundColor = "#8bc53f";
            }
        }
    }
}
getList(highlight);