/* 将 html 字符串转 dom 对象 */
function loadHTMLString(txt) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(txt, "text/html");
    return htmlDoc;
}

function concatArrays(array) {
    let result = [];
    for (var i = array.length - 1; i >= 0; i--) {
        result = result.concat(array[i]);
    }
    return result;
}

// 解析影片列表
function parseMovies(htmlDoc) {
    const listDom = htmlDoc.getElementsByClassName("videotextlist")[0];
    const movieDoms = listDom.getElementsByTagName("a");

    const movies = [];
    for (var i = 0; i < movieDoms.length; i++) {
        const txt = movieDoms[i].textContent;
        const regex = /[A-Z]+-[0-9]+/ig;
        const id = regex.exec(txt)[0];
        const name = txt.slice(id.length);
        const movie = { id, name, };
        movies.push(movie);
    }
    return movies;
}

// 解析影片总数量及页数
function parseTotal(htmlDoc) {
    const totalDom = htmlDoc.getElementsByClassName("boxtitle")[0];
    const total = Number(totalDom.textContent.slice(8));
    const pages = total / 20 + 1;
    return { total, pages, };
}

function getTotal() {
    return axios.get('http://www.ja14b.com/cn/mv_owned.php')
        .then((response) => {
            const htmlDoc = loadHTMLString(response.data);
            result = parseTotal(htmlDoc);
            return result;
        });
}

function getMovies(page) {
    return axios.get(`http://www.ja14b.com/cn/mv_owned.php?&sort=saledate&page=${page}`)
        .then((response) => {
            const htmlDoc = loadHTMLString(response.data);
            movies = parseMovies(htmlDoc);
            return movies;
        });
}

function saveList(list) {
    chrome.storage.local.set({ 'jav': list });
}

function syncMovies() {
    return getTotal().then((result) => {
        const task = [];
        for (var i = 1; i <= result.pages; i++) {
            task.push(getMovies(i));
        }
        return axios.all(task)
            .then(axios.spread((...datas) => {
                lib = concatArrays(datas);
                return lib;
            }));
    });
}



document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    const button = document.getElementById('getCollections');
    button.addEventListener('click', () => {
        console.log("Clicked getCollections button");
        syncMovies().then(lib => {
            saveList(lib);
        });
    });
});