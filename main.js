const API_KEY = ""

let url = "";
let news = [];

let totalResults = 0;
let page = 1;
const pageSize = 10;
const groupSize = 5;

let searchIcon = document.getElementById("search-icon")
let searchInput = document.getElementById("search-input")
let searchButton = document.getElementById("search-button")
let categoryList = document.querySelectorAll(".nav-pills a")
let sidebarList = document.querySelectorAll("#menu-list a")

searchIcon.addEventListener("click", visibleSearch)
searchButton.addEventListener("click", searchArticle)
document.addEventListener("keypress", handleEnterKeyPress)

const openNav = () => {
    document.getElementById("mySidenav").style.width = "250px";
};
  
const closeNav = () => {
    document.getElementById("mySidenav").style.width = "0";
};

categoryList.forEach(item => {
    item.addEventListener("click", function(){
        categoryList.forEach(link => {
            link.classList.remove("active")
        })

        item.classList.add("active")
        changeCategory(item.textContent);
    })
});

sidebarList.forEach(item => {
    item.addEventListener("click", function(){
        
        changeCategory(item.textContent);

        categoryList.forEach(link => {
            if (link.textContent == item.textContent){
                link.classList.add("active")
            }
            else {
                link.classList.remove("active")
            }
        })

        closeNav();
    })
});

function visibleSearch(){
    searchButton.style.display = searchButton.style.display === 'block' ? 'none' : 'block';
    searchInput.style.display = searchInput.style.display === 'block' ? 'none' : 'block';
}

async function getArticle(){

    try{
        url.searchParams.set("page", page);
        url.searchParams.set("pageSize", pageSize);

        const response = await fetch(url);
        const data = await response.json();

        news = data.articles;
        totalResults = data.totalResults

        console.log(news);
        console.log(totalResults);
        
        if (news.length < 1){
            throw new Error("No matches for your search")
        }
        if (response.status != 200){
            const responseError = {
                400: "Bad Request",
                401: "Unauthorized",
                404: "Not Found",
                429: "Too Many Requests",
                500: "Server Error"
            }

            throw new Error(responseError[response.status])
        }
        render();
        paginationRender();
    }
    catch(error){

        let resultHTML = `
        <div class="alert alert-danger" role="alert">
            ${error}
        </div>
        `;
        document.getElementById("article-group").innerHTML = resultHTML;
    }
}

function render(){

    let resultHTML = "";

    let summary;
    let urlToImage;
    let source;

    for (let i = 0; i < news.length; i++){
        summary = news[i].description
        urlToImage = news[i].urlToImage
        source = news[i].source.name

        if (summary === null || summary === undefined){
            summary = "내용 없음"
        }
        else if (summary.length > 200){
            summary = summary.toString().substr(0, 200) + '...';
        }

        if (urlToImage === null || urlToImage === undefined || urlToImage.length == 0){
            urlToImage = "./NotImage.JPG";
        }

        if (source === null || source === undefined || source.length == 0){
            source = "no source"
        }

        resultHTML += `
        <div class="card mb-3">
            <div class="row g-0">
                <div class="col-md-4">
                <img src="${urlToImage}" class="img-fluid rounded-start">
                </div>
                <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title title"><a href=${news[i].url}>${news[i].title}</a></h5>
                    <p class="card-text article-text">${summary}</p>
                    <p class="card-text article-text"><small class="text-muted">${source} ${moment(news[i].publishedAt).fromNow()}</small></p>
                </div>
                </div>
            </div>
        </div>
        `
    }

    document.getElementById("article-group").innerHTML = resultHTML;
}

function handleEnterKeyPress(event){

    if (event.which === 13 || event.keyCode === 13){
        if (searchButton.style.display != 'none' && searchInput.value != null && searchInput.value != undefined && searchInput.value != ""){
            searchArticle();
        }
    }
}

function getLatestArticle(){
    page = 1;

    url = new URL(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
    getArticle(url);
}

function searchArticle(){
    page = 1;

    if (searchInput.value != null && searchInput.value != undefined  && searchInput.value != ""){
        url = new URL(`https://newsapi.org/v2/top-headlines?q=${searchInput.value}&apiKey=${API_KEY}`);
        getArticle(url);
    }

}

function changeCategory(category){
    page = 1;
    
    category = category.toLowerCase();
    url = new URL(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`);
    getArticle(url);

}

const paginationRender = () => {
    const totalPages = Math.ceil(totalResults/pageSize);
    const pageGroup = Math.ceil(page / groupSize);

    let lastPage = pageGroup * groupSize; //마지막 페이지 그룹이 그룹 사이즈보다 작다? lastpage == totalpage
    if (lastPage > totalPages){
        lastPage = totalPages;
    }

    const firstPage = lastPage - (groupSize - 1) <= 0 ? 1 : lastPage - (groupSize - 1);

    let paginationHTML = ''
    if (page===1) {
        paginationHTML = `<li class="page-item nonvisible"><a class="page-link" tabindex="-1" aria-disabled="true"><<</a></li>`
        paginationHTML += `<li class="page-item nonvisible"><a class="page-link" tabindex="-1" aria-disabled="true">Previous</a></li>`
    
    } else {
        paginationHTML = `<li class="page-item" onclick="moveToPage(${1})"><a class="page-link" tabindex="-1" aria-disabled="true"><<</a></li>`
        paginationHTML += `<li class="page-item" onclick="moveToPage(${page-1})"><a class="page-link" tabindex="-1" aria-disabled="true">Previous</a></li>`
    }

    for (let i = firstPage; i <= lastPage; i++){
        paginationHTML += `<li class="page-item ${i===page?'active':''}" onclick="moveToPage(${i})"><a class="page-link">${i}</a></li>`
    }

    if (page === totalPages) {
        paginationHTML += `<li class="page-item nonvisible"><a class="page-link" tabindex="-1" aria-disabled="true">Next</a></li>`
        paginationHTML += `<li class="page-item nonvisible"><a class="page-link" tabindex="-1" aria-disabled="true">>></a></li>`

    } else {
        paginationHTML += `<li class="page-item" onclick="moveToPage(${page+1})"><a class="page-link" tabindex="-1" aria-disabled="true">Next</a></li>`
        paginationHTML += `<li class="page-item" onclick="moveToPage(${totalPages})"><a class="page-link" tabindex="-1" aria-disabled="true">>></a></li>`
    }

    document.querySelector(".pagination").innerHTML = paginationHTML;
}

const moveToPage = (pageNumber) => {
    page = pageNumber
    getArticle();
}

getLatestArticle();