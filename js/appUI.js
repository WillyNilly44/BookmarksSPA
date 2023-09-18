//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let selectedcat = '';
let filterCat = '';
Init_UI();

function Init_UI() {
    renderBookmarks();

    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#catCmd').on("click", function () {
        renderBookmark();
    })
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: William Sauvé
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des bookmarks");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarks();
    let cats = [];

    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            if(filterCat != ''&& bookmark.Catégorie == selectedcat)
            {
                $("#content").append(renderBookmark(bookmark));
            }
            else if(filterCat == '')
            {
                $("#content").append(renderBookmark(bookmark))
            }
            ;
            if (!cats.includes(bookmark.Catégorie)) {
                cats.push(bookmark.Catégorie);
            }
        });
        LoadCategories(cats, selectedcat);

        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $("#ToutCmd").on("click", function () {
            selectedcat = '';
            renderBookmarks();
        })
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { })
        $(".cate").on("click", function () {
            selectedcat = $(this).attr("cateid");
            renderBookmarks();
        })
    } else {
        renderError("Service introuvable");
    }
}
function LoadCategories(cats, selectedcat) {
    $("#Categories").empty();
    cats.forEach(item => {
        $("#Categories").append(renderCategorie(item, item == selectedcat));
    })
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Bookmark introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                    <div class="bookmarkLayout">
                        <div class="bookmarkTitle">${bookmark.Title}</div>
                        <div class="bookmarkURL">${bookmark.Url}</div>
                        <div class="bookmarkCat">${bookmark.Catégorie}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Bookmark introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Catégorie = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    let afficon=""
    if(bookmark.Url == "")
    {
        afficon = ' <img src="images.png" class="appLogo" alt="" title="Gestionnaire de Bookmark">'
    }
    else
    {
        afficon= '<a href="${bookmark.Url}"><img class="bookmarkLogo" src="https://www.google.com/s2/favicons?sz=32&domain=${bookmark.Url}"></a>';
    }
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <a href="${bookmark.Url}"><img class="bookmarkLogo" src="https://www.google.com/s2/favicons?sz=32&domain=${bookmark.Url}"></a>
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            ${afficon}
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer l'Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${bookmark.Url}" 
            />
            <label for="Catégorie" class="form-label">Catégorie </label>
            <input 
                class="form-control Alpha"
                name="Catégorie"
                id="Catégorie"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer la catégorie" 
                InvalidMessage="Veuillez entrer un catégorie valide"
                value="${bookmark.Catégorie}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    return $(`
     <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
                <div style="display:'grid'">
                <a href="${bookmark.Url}"><img class="bookmarkLogo" src="https://www.google.com/s2/favicons?sz=32&domain=${bookmark.Url}"></a>
                    <span class="bookmarkTitle">${bookmark.Title}</span>
                </div>
                <span class="bookmarkCat">${bookmark.Catégorie}</span>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}

function renderCategorie(item, checked = false) {
    let checkedattribute = checked ? 'fa-solid fa-check' : "fa-solid fa-fw";
    return $(`
    <div class="dropdown-item cate"  cateid="${item}">
    <i class="${checkedattribute}"></i>
    ${item}
    </div>        
    `);
}