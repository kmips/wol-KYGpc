// Renderer javascript for index.html

//Intro
const { remote, shell, ipcRenderer, webFrame } = require("electron");

//Our app's version for comparison below
thisAppVersion = remote.app.getVersion();

// Get the data about collections from mydata.js and set it to our variable for use.
const myData = require("../mydata");

//This is the array with information about our collections in an array
const initialState = myData.collections;

//Set up variables to hold the current state of our two windows and other important bits
let currentStateMainWindow = [];
let currentStateSecWindow = [];
let displayLang;
defaultFontName = myData.otherText.defaultFont.substr(
  0,
  myData.otherText.defaultFont.indexOf(".")
);

//Include the style definition necessary for the default font the sidebar is displayed in
var cssToAdd = `
  @font-face {
    font-family: "${defaultFontName}";
    font-style: normal;
    src: 
      url(./${myData.otherText.defaultFont}) format("truetype");
  }
  `;
//css insert https://www.electronjs.org/docs/api/web-frame#webframeinsertcsscss
webFrame.insertCSS(cssToAdd);

//Check the if the app has been previously run and if version is same as last run.
//If lastOpenedVersion is null, then it's a new open.
if (localStorage.getItem("lastOpenedVersion") === null) {
  //set things up for first run: set a variable in local storage equal to current app version and continue.
  //You don't need to set up lastKnownStateMainWin now, the app will do that as you change panes
  localStorage.setItem("lastOpenedVersion", JSON.stringify(thisAppVersion));

  //This is in case of a first run, this populates the session memory with the array for the folders and pages.
  currentStateMainWindow = initialState;
  currentStateSecWindow = initialState;
  localStorage.setItem(
    "lastKnownStateMainWin",
    JSON.stringify(currentStateMainWindow)
  );
  localStorage.setItem(
    "lastKnownStateSecWin",
    JSON.stringify(currentStateSecWindow)
  );

  //This gets us our default interface lang from myData.
  displayLang = myData.otherText.defaultLang;
  localStorage.setItem("lastKnownDisplayLanguage", JSON.stringify(displayLang));

  //Let the main process know the displayLang
  ipcRenderer.send("set-display-lang", displayLang);

  //when we open search for the first time, build the index
  let rebuildIndex = true;
  localStorage.setItem("rebuildIndex", JSON.stringify(rebuildIndex));
}

//Or if the last version opened is the same as this one,
else if (
  JSON.parse(localStorage.getItem("lastOpenedVersion")) === thisAppVersion
) {
  //get the stored values for panes' last known states into our session memory for use.
  currentStateMainWindow = JSON.parse(
    localStorage.getItem("lastKnownStateMainWin")
  );
  currentStateSecWindow = JSON.parse(
    localStorage.getItem("lastKnownStateSecWin")
  );

  if (localStorage.getItem("lastKnownDisplayLanguage") === null) {
    displayLang = myData.otherText.defaultLang;
    localStorage.setItem(
      "lastKnownDisplayLanguage",
      JSON.stringify(displayLang)
    );
  } else {
    displayLang = JSON.parse(localStorage.getItem("lastKnownDisplayLanguage"));
  }

  //Let the main process know the displayLang
  ipcRenderer.send("set-display-lang", displayLang);
}

//Or if we've upgraded, chances are we've added pages or collections, so reinitialize - that is:
else if (
  !(JSON.parse(localStorage.getItem("lastOpenedVersion")) === thisAppVersion)
) {
  //save our new version number
  localStorage.setItem("lastOpenedVersion", JSON.stringify(thisAppVersion));

  //and throw away the old lastKnownStateMainWin and use the initialState values from mydata.js.
  localStorage.removeItem("lastKnownStateMainWin");
  localStorage.removeItem("lastKnownStateSecWin");
  currentStateMainWindow = initialState;
  currentStateSecWindow = initialState;
  localStorage.setItem(
    "lastKnownStateMainWin",
    JSON.stringify(currentStateMainWindow)
  );
  localStorage.setItem(
    "lastKnownStateSecWin",
    JSON.stringify(currentStateSecWindow)
  );

  //when we open search for the first time, build the index
  let rebuildIndex = true;
  localStorage.setItem("rebuildIndex", JSON.stringify(rebuildIndex));

  //Let the main process know the displayLang
  //This gets us our default interface lang from myData.
  if (localStorage.getItem("lastKnownDisplayLanguage") === null) {
    displayLang = myData.otherText.defaultLang;
    localStorage.setItem(
      "lastKnownDisplayLanguage",
      JSON.stringify(displayLang)
    );
  } else {
    displayLang = JSON.parse(localStorage.getItem("lastKnownDisplayLanguage"));
  }
  ipcRenderer.send("set-display-lang", displayLang);
}

//Get text for the other translations from myTranslations array; the app's invitation to open and close second window and to give feedback.
const appInvToOpen = myData.myTranslations.invToOpen[displayLang],
  appSearchText = myData.myTranslations.menuSearch[displayLang],
  appInvToClose = myData.myTranslations.invToClose[displayLang],
  appFeedback = myData.myTranslations.giveFeedback[displayLang],
  appFeedbackemail = myData.otherText.giveFeedbackemail,
  appFeedbacksubject = myData.myTranslations.giveFeedbacksubject[displayLang],
  thisAppName = myData.otherText.thisAppName,
  appMenuWebsite = myData.myTranslations.menuWebsite[displayLang],
  appMenuWebURL = myData.otherText.menuWebURL;

//Housekeeping for the app builder; end users will not see these messages:
//Give the app builder a message if they have put feedback message but no email or subject
if (!(appFeedback === "") && appFeedbackemail === "") {
  alert(
    `Menu item for app feedback is enabled but no email address is entered. Check out otherText section of mydata.js.`
  );
}

//Give app builder a msg if they have a 'visit our website' message but not website set
if (!(appMenuWebsite === "") && appMenuWebURL === "") {
  alert(
    `Menu item for "visit our website" is enabled but no site address is entered. Check out otherText section of mydata.js.`
  );
}

//---------------------------------------------
//** Navigation and saving lastKnownStateMainWin

//set up the click handler that we'll use below when one of the sidemenu items are clicked.
const sideBarClick = (e) => {
  //Here is the current path on the iframe
  var iframeSource = document.getElementById("mainFrame").contentDocument.URL;

  // .split() takes a string and splits it into an array by the character in the parentheses,
  // so here we make the array with the info about what the window is currently showing in the iframe
  var iframeInfotoSave = iframeSource.split("/");

  //.pop returns the last item in an array and simultaneously eliminates it from the array.
  //So here is the last element in the array, the page, split out from the path
  pageToSave = iframeInfotoSave.pop();

  //And here is the folder name split out from the path
  folderToSave = iframeInfotoSave.pop();

  //Note that we are identifying which window we're in and therefore which datatset to use
  //by looking at the arbitrary text 'dataset' that is coming from the link itself, not from observing the active window
  if (e.currentTarget.dataset.windowName === "mainWin") {
    //i here is the index number of the array currentStateMainWindow where myData.collections.folder = folderToSave from above
    var i = currentStateMainWindow.findIndex(
      (obj) => obj.folder === folderToSave
    );

    //Now change the array to set the window we are leaving so we can come back to it when the user returns to that collection
    currentStateMainWindow[i].fileToView = pageToSave;

    //That's the page we're leaving, now this is the page we are going to.

    //First find the page that has been stored in the array for the folder we're heading to.
    //e.currentTarget is info coming from the link the user just clicked on
    var i = currentStateMainWindow.findIndex(
      (obj) => obj.folder === e.currentTarget.dataset.folder
    );

    //Set the iframe to the new destination: e.currentTarget is the link the user just clicked on;
    //currentStateMainWindow[i].fileToView is coming straight from the array at index number i.
    document.getElementById(
      "mainFrame"
    ).src = `./${e.currentTarget.dataset.folder}/${currentStateMainWindow[i].fileToView}`;

    //This loads the nodeintegration safety for hyperlinks
    document.getElementById("mainFrame").onload = () => {
      loadHTTPHandlerInIframe();
    };

    //To help the user keep track of where they are, set the collection name in the title bar
    remote
      .getCurrentWindow()
      .setTitle(
        thisAppName + "   ||   " + e.currentTarget.dataset.collectionName
      );

    //Now the info is stored in memory, go ahead and store to localStorage so it will survive a crash etc.
    localStorage.setItem(
      "lastKnownStateMainWin",
      JSON.stringify(currentStateMainWindow)
    );
  } else if (e.currentTarget.dataset.windowName === "secWin") {
    //This is the same as above and it would be nicer to have it in one function rather than an if
    //but I'm afraid it would render it much harder to understand -- for me anyway
    var i = currentStateSecWindow.findIndex(
      (obj) => obj.folder === folderToSave
    );
    currentStateSecWindow[i].fileToView = pageToSave;
    var i = currentStateSecWindow.findIndex(
      (obj) => obj.folder === e.currentTarget.dataset.folder
    );
    document.getElementById(
      "mainFrame"
    ).src = `./${e.currentTarget.dataset.folder}/${currentStateSecWindow[i].fileToView}`;
    remote
      .getCurrentWindow()
      .setTitle(
        thisAppName + "   ||   " + e.currentTarget.dataset.collectionName
      );
    localStorage.setItem(
      "lastKnownStateSecWin",
      JSON.stringify(currentStateSecWindow)
    );
  }
};

//------------------------------
//***Sidebar construction on load***
//This is a variable we'll use as a shortcut to refer to the place to put the new sidebarMenuItem.
let sidebarMenu = document.getElementById("mySidebar");

//This populates the sidebar on load with collection information from mydata.js, referred to here by myData
//Set up the loop to do for each item in the array 'collections'
myData.collections.forEach((item) => {
  //set up the sidebarMenuItem, which will be used for each of the items in the array "collections" exported from mydata.js above.
  //It's a link <a>
  let sidebarMenuItem = document.createElement("a");

  //set href to # for this a
  sidebarMenuItem.setAttribute("href", "#");

  //These next two set arbitrary text in the 'dataset' array.
  //The syntax is "data-" >> "dataset" when setting and then calling it and item-thing to itemThing - in other words
  // data-url >> dataset.url when we call it.
  //We are setting here the value to the value in our array, e.g. item.folder and then
  //data-first-file >> dataset.firstFile when we call it
  //For more: https://www.w3schools.com/tags/att_global_data.asp

  //Store in the link the name of the folder and the name of the collection for use later on
  sidebarMenuItem.setAttribute("data-folder", item.folder);
  sidebarMenuItem.setAttribute("data-collection-name", item.name);

  //We use this code twice, once for mainWin and once for secWin, mark them on construction with a label that we can come back to later.
  if (remote.getGlobal("sharedObj").loadingMain === true) {
    sidebarMenuItem.setAttribute("data-window-name", "mainWin");
  } else if (remote.getGlobal("sharedObj").loadingMain === false) {
    sidebarMenuItem.setAttribute("data-window-name", "secWin");
  }

  //text with variables that goes inside the <a></a> tag.
  //Remember this loops for each collection so each in its turn will get its information included in a separate entry
  sidebarMenuItem.innerHTML = `<span><i class="material-icons">${item.icon}</i><span style="font-family:${defaultFontName}" class="icon-text">${item.name}</span>`;

  // Append new node to "sidebarMenu" div
  //remember 'sidebarMenu' is document.getElementById('mySidebar') in index.htm.
  //sidebarMenuItem is the new a with the icon, text, and initial URL that we have set up.
  sidebarMenu.appendChild(sidebarMenuItem);

  // Attach click handler to select
  sidebarMenuItem.addEventListener("click", sideBarClick);

  //This enables us to put a blank line or horizontal line between each
  if (item.horizontalLineFollows === false) {
    sidebarMenu.appendChild(document.createElement("br"));
  } else if (item.horizontalLineFollows === true) {
    sidebarMenu.appendChild(document.createElement("hr"));
    sidebarMenu.appendChild(document.createElement("br"));
  }

  //To finish, set the iframe source to be the first collection, but the lastKnownState file on open.
  if (remote.getGlobal("sharedObj").loadingMain === true) {
    document.getElementById(
      "mainFrame"
    ).src = `./${currentStateMainWindow[0].folder}/${currentStateMainWindow[0].fileToView}`;
  } else if (remote.getGlobal("sharedObj").loadingMain === false) {
    document.getElementById(
      "mainFrame"
    ).src = `./${currentStateSecWindow[0].folder}/${currentStateSecWindow[0].fileToView}`;
  }
});

//Now add the sidebarBottom div to hold the bottom icons
let sidebarMenuBottomDiv = document.createElement("div");
sidebarMenuBottomDiv.setAttribute("class", "sidebarBottom");
sidebarMenuBottomDiv.setAttribute("id", "mySidebarBottom");
sidebarMenu.appendChild(sidebarMenuBottomDiv);

//Now add the button at the bottom of the sidebar for a new screen
//We only want that on the main window, so do an if to pick it up
if (remote.getGlobal("sharedObj").loadingMain === true) {
  sidebarMenuBottomDiv = document.getElementById("mySidebarBottom");

  //Insert the Search button
  sidebarMenuItem = document.createElement("a");
  sidebarMenuItem.setAttribute("href", "#");
  sidebarMenuItem.setAttribute("id", "searchButton");
  sidebarMenuItem.innerHTML = `<span><i class="material-icons" id="search-icon">pageview</i><span style="font-family:${defaultFontName}" class="icon-text">${appSearchText}</span>`;
  sidebarMenuBottomDiv.appendChild(sidebarMenuItem);
  sidebarMenuItem.addEventListener("click", openSearch);
  sidebarMenuBottomDiv.appendChild(document.createElement("br"));

  //Insert the Two Pane Open button
  sidebarMenuItem = document.createElement("a");
  sidebarMenuItem.setAttribute("href", "#");
  sidebarMenuItem.setAttribute("id", "twoPaneButton");
  sidebarMenuItem.setAttribute("data-open-close-state", "InvToOpen");
  sidebarMenuItem.innerHTML = `<span><i class="material-icons" id="two-window-icon">library_add</i><span style="font-family:${defaultFontName}" class="icon-text">${appInvToOpen}</span>`;
  sidebarMenuBottomDiv.appendChild(sidebarMenuItem);
  sidebarMenuItem.addEventListener("click", openOrCloseNewWindow);

  //This adds a contact us button, but only if there is one defined in mydata.js.
  if (!(appFeedback === "")) {
    //This enables us to put a blank line in between each
    sidebarMenuBottomDiv.appendChild(document.createElement("br"));
    sidebarMenuItem = document.createElement("a");
    sidebarMenuItem.setAttribute(
      `href`,
      `mailto:${appFeedbackemail}?subject=${appFeedbacksubject}`
    );
    sidebarMenuItem.innerHTML = `<span><i class="material-icons">local_post_office</i><span style="font-family:${defaultFontName}" class="icon-text">${appFeedback}</span>`;
    sidebarMenuBottomDiv.appendChild(sidebarMenuItem);
    sidebarMenuBottomDiv.appendChild(document.createElement("br"));
  }
}

//** Event listeners/handlers

//The context menu is coming from myjs.js and triggered in main.js. But we don't want to
//show contextmenu in the sidebar because it looks strange. So this
//1) the "if" statement checks to see if that element exists
//  (if you don't have it and you don't check it throws an error - i.e. copyright page) and
//2) suppresses it just in that mySidebar div.
if (document.getElementById("mainFrame")) {
  document.getElementById("mySidebar").addEventListener("contextmenu", (e) => {
    e.preventDefault(), false;
  });
}

//the menu and its associated accelerators only work on Mac, so we have to manually add accelerators for non-Mac platforms
function getAccelerators() {
  if (
    (event.ctrlKey && event.key === "c") ||
    (event.metaKey && event.key === "c")
  ) {
    document
      .getElementById("mainFrame")
      .contentWindow.document.execCommand("copy");
  } else if (
    (event.ctrlKey && event.key === "a") ||
    (event.metaKey && event.key === "a")
  ) {
    document
      .getElementById("mainFrame")
      .contentWindow.document.execCommand("selectAll");
  } else if (
    (event.ctrlKey && event.key === "+") ||
    (event.metaKey && event.key === "+") ||
    (event.ctrlKey && event.shiftKey && event.key === "=") ||
    (event.metaKey && event.shiftKey && event.key === "=")
  ) {
    webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
  } else if (
    (event.ctrlKey && event.key === "-") ||
    (event.metaKey && event.key === "-")
  ) {
    webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
  } else if (
    (event.ctrlKey && event.key === "0") ||
    (event.metaKey && event.key === "0")
  ) {
    webFrame.setZoomFactor(1);
  }
}

//Safety with nodeintegration:
//Our index.html has no outside links so they can be normally handled. But often an HTML collection will have
//an outside link, perhaps for a copyright page or other information. Here we want to parse for relative hyperlinks
//and let those go, but open all others in the user's default browser.

//Wrapping the onclick event in the onload event is important because you have to reload this code each time the iframe reloads
//as the onclick event is really applied to the iframe's contents. When the contents chagnes (onload) you have to reapply the handler.
//Define it as a function
function loadHTTPHandlerInIframe() {
  document
    .getElementById("mainFrame")
    .contentWindow.document.addEventListener("click", (event) => {
      addEventListener;

      if (
        event.target.tagName === "A" &&
        event.target.href.startsWith("http")
      ) {
        event.preventDefault();
        shell.openExternal(event.target.href);
      }
    });
}

//This loads with thie initial load - it has to get refired with each iframe change on sidebarclick and search result open.
document.getElementById("mainFrame").onload = () => {
  loadHTTPHandlerInIframe();
};

//You have to run getAccelerators() both here on the mainFrame (the iframe) in the onload event and on the document (see below) for them to
//work in all cases when not on Mac. If only in one, when the other has focus doesn't work.
if (!remote.process.platform === "darwin") {
  document.getElementById(
    "mainFrame"
  ).contentWindow.document.onkeydown = () => {
    getAccelerators();
  };
}

//See right above in the mainFrame onload - this loads the accelerators for the rest of the window when not on Mac
if (!remote.process.platform === "darwin") {
  document.onkeydown = () => {
    getAccelerators();
  };
}

//** Functions

//These two open and close the sidebar menu.
function openSidebar() {
  document.getElementById("mySidebar").style.width = "250px";
}

function closeSidebar() {
  document.getElementById("mySidebar").style.width = "85px";
}

function openOrCloseNewWindow(displayLang) {
  //Get the main process to open the secondary window
  //This checks if the invitation to open is showing:
  if (twoPaneButton.dataset.openCloseState === "InvToOpen") {
    //see this function lower down a bit - changes icon and text for the new window button as well as the dataset marker
    toggleButtonIcon();
    //Send via ipcRenderer to the main process on channel 'secondary-window' the message
    //'open-sec' or 'close-sec' the secondary window.
    ipcRenderer.send("secondary-window", "open-sec");
  } else if (twoPaneButton.dataset.openCloseState === "InvToClose") {
    //here the toggle button was not set to library_add so we know the secondary window is open - close it
    ipcRenderer.send("secondary-window", "close-sec");
    //Change the marker so we know what state we're in, invitation to open or to close showing.

    //One expects toggleButtonIcon() here, but it is called from sec-window-is-closed-main-window-actions below
    //so that it gets triggered no matter how the user closes SecWindow (via x or via the sidebarmenu).
  }
}

//Send a message to main.js to open the search window
function openSearch() {
  ipcRenderer.send("open-search", displayLang);
}

//There are only two options, the interface can either offer to open secondary window or close it.
//The options just go back and forth when this is triggered.
function toggleButtonIcon() {
  let twoPaneButton = document.getElementById("twoPaneButton");
  if (twoPaneButton.dataset.openCloseState === "InvToOpen") {
    twoPaneButton.dataset.openCloseState = "InvToClose";
    twoPaneButton.innerHTML = `<span><i class="material-icons" id="two-window-icon">indeterminate_check_box</i><span style="font-family:${defaultFontName}" class="icon-text">${appInvToClose}</span>`;
  } else if (twoPaneButton.dataset.openCloseState === "InvToClose") {
    twoPaneButton.dataset.openCloseState = "InvToOpen";
    twoPaneButton.innerHTML = `<span><i class="material-icons" id="two-window-icon">library_add</i><span style="font-family:${defaultFontName}" class="icon-text">${appInvToOpen}</span>`;
  }
}

// Save and persist storage
function saveDataMainWindow() {
  var iframeSource = document.getElementById("mainFrame").contentDocument.URL;
  var iframeInfotoSave = iframeSource.split("/");
  pageToSave = iframeInfotoSave.pop();
  folderToSave = iframeInfotoSave.pop();
  var i = currentStateMainWindow.findIndex(
    (obj) => obj.folder === folderToSave
  );
  currentStateMainWindow[i].fileToView = pageToSave;
  localStorage.setItem(
    "lastKnownStateMainWin",
    JSON.stringify(currentStateMainWindow)
  );
}

function saveDataSecWindow() {
  var iframeSource = document.getElementById("mainFrame").contentDocument.URL;

  var iframeInfotoSave = iframeSource.split("/");
  pageToSave = iframeInfotoSave.pop();
  folderToSave = iframeInfotoSave.pop();
  var i = currentStateSecWindow.findIndex((obj) => obj.folder === folderToSave);
  currentStateSecWindow[i].fileToView = pageToSave;
  localStorage.setItem(
    "lastKnownStateSecWin",
    JSON.stringify(currentStateSecWindow)
  );
}

//** ipcRenderer listener */
//If the user closes the secondary window in any way other than the button in the sidebar
//main process lets you know. Here we receive the message that the secondary window is closed
//so that we can put the button and icon back to "open me"
ipcRenderer.on("sec-window-is-closed-sec-window-actions", (e) => {
  saveDataSecWindow();
});

ipcRenderer.on("sec-window-is-closed-main-window-actions", (e) => {
  toggleButtonIcon();
});

ipcRenderer.on("mainWin-closing-save-data", (e) => {
  saveDataMainWindow();
});

//Fired when the user changes interface language. It has two parts, changing lang in renderer (via a message that comes back from ipcMAin) and main processes for the menu.
ipcRenderer.on("language-switch", (e, lang) => {
  //Call this function from above to save the page
  saveDataMainWindow();
  //Store the incoming language request to localStorage
  localStorage.setItem("lastKnownDisplayLanguage", JSON.stringify(lang));
  //Now send a message back to main.js to reload the page
  ipcRenderer.send("lang-changed-reload-pages");
});

function getChildren(n, skipMe) {
  var r = [];
  for (; n; n = n.nextSibling) if (n.nodeType == 1 && n != skipMe) r.push(n);
  return r;
}

function getSiblings(n) {
  return getChildren(n.parentNode.firstChild, n);
}

//******************************
//This is the message that is received here in the mainWindow from main process with the message to open the chosen search result's page.
ipcRenderer.on("open-search-result-main-to-mainWindow", (e, openthis) => {
  //Get a reference to the iframe
  var iframe = document.getElementById("mainFrame");

  //Here is the current path on the iframe
  var iframeSource = iframe.contentDocument.URL;

  // .split() takes a string and splits it into an array by the character in the parentheses,
  // so here we make the array with the info about what the window is currently showing in the iframe
  var iframeInfotoSave = iframeSource.split("/");

  //.pop returns the last item in an array and simultaneously eliminates it from the array.
  //So here is the last element in the array, the page, split out from the path
  pageToSave = iframeInfotoSave.pop();
  //And here is the folder name split out from the path
  folderToSave = iframeInfotoSave.pop();

  //i here is the index number of the array currentStateMainWindow where myData.collections.folder = folderToSave from above
  var i = currentStateMainWindow.findIndex(
    (obj) => obj.folder === folderToSave
  );

  //Now change the array to set the window we are leaving so we can come back to it when the user returns to that collection
  currentStateMainWindow[i].fileToView = pageToSave;
  //Now the info is stored in memory, go ahead and store to localStorage so it will survive a crash etc.
  localStorage.setItem(
    "lastKnownStateMainWin",
    JSON.stringify(currentStateMainWindow)
  );
  //That's the page we're leaving, now this is the page we are going to.

  //Set the iframe to the new destination, our search result:
  var linkToOpen = `./${openthis.folder}/${openthis.file}`;
  iframe.src = linkToOpen;

  iframe.onload = () => {
    //Include the styles definition necessary for the fading highlight animation
    var cssToAdd = `@keyframes animationCode {
      from {background-color: gold;}
      to {background-color: transparent;}
    }
    .textToAnimate {
      background-color: transparent;
      animation-name: animationCode;
      animation-duration: 4s;
    }
    
    body {margin: 100px;}`;

    //css insert https://www.electronjs.org/docs/api/web-frame#webframeinsertcsscss
    //Here firstChild refers to the iframe - you have to get the css into the frame, not into the webFrame.
    webFrame.firstChild.insertCSS(cssToAdd);

    //When we open the target chapter in the iframe scroll to content
    var scrollTarget = `v${openthis.verseNumber}`;
    var elmnt = iframe.contentWindow.document.getElementById(scrollTarget)
      .offsetTop;
    iframe.contentWindow.scrollTo({ top: elmnt - 70, behavior: "smooth" });

    //**Insert highlighting style:
    //Get an array of the verses in the chapter
    let verseArray = iframe.contentWindow.document.getElementsByClassName("v");

    //Get the index of the one that we want
    for (var i = 0, len = verseArray.length | 0; i < len; i = (i + 1) | 0) {
      //This var we'll use later to tell how far to keep highlighting
      var foundIt = false;
      //For RTL you have to filter out for the RLM before the number with regex
      var currentVerseNumber = verseArray[i].innerText.match(/\s*(\d+)/);
      //get the first match: index[0]
      if (currentVerseNumber[0] == openthis.verseNumber) {
        //Set up the loop that will do the highlighting
        var el = verseArray[i].nextSibling;
        var j = 1;
        //we want to go til we get to this text:
        var endAt = `<span id="bookmarks${openthis.verseNumber}"></span>`;

        //Here is the function as a separate unit:
        function highlightTextSpans(el) {
          while (el) {
            // debugger;
            //Nodetype 3 is the text node type, and our verses are in that type
            if (el.nodeType === 3) {
              //Here is the string
              var animationSpanTextOnly = `<span class="textToAnimate">${el.data}</span>`;
              //Now insert that string after the previous element and the one we're intersted in.
              //Text nodes have fewer methods and you can't insert HTML or appendChild or many of those useful things so have to key on the previous element.
              el.previousSibling.insertAdjacentHTML(
                "afterend",
                animationSpanTextOnly
              );
              //Now zero out the text of the element itself - on of the few things we can do.
              el.data = "";
            }
            //The next case is if it's not text type, but it is a inline footnote, apply the style there too
            else if (el.nodeType !== 3 && el.className.includes("footnote")) {
              el.classList.add("textToAnimate");
            }
            //We're looking for the end of the verse, bookmarksVERSENO - so end there.
            else if (el.nodeType === 1 && el.outerHTML.toString() == endAt) {
              foundIt = true;
              break;
            }

            //In case of runaway cases just for safety's sake, hopefully not used
            if (j === 100) {
              console.log("over 100");
              break;
            }
            //Go to the next sibling and increment our counter
            el = el.nextSibling;
            j++;
          }
        }
        //this is the usual case, where a verse does not span a paragraph break.
        highlightTextSpans(el);

        //the other case is where the verse is broken up into several paragraphs
        var currentDiv = verseArray[i].parentNode;

        //Again here we use foundIt to tell in a couple cases when to stop highlighting.
        while (!(foundIt === true)) {
          //Starting from the paragraph we already highlighted, go on to the next units.
          currentDiv = currentDiv.nextSibling;
          //These are in all cases we've seen so far poetry, so not prose type paragraphs with the text type of node so the logic here is different.
          if (
            //If currentnode is an element and it's not the verse-ending text we're looking for, endAt:
            (currentDiv.nodeType === 1 &&
              currentDiv.outerHTML.toString() == endAt) ||
            // Or if we come to a section break that's far enough
            currentDiv.className === "s" ||
            currentDiv.className === "ms" ||
            currentDiv.className === "footer"
          ) {
            //We're good, close it up.
            foundIt = true;
            break;
          }
          //Or if it's not where we should end and not a textnode, then add the class
          else if (currentDiv.nodeType !== 3) {
            currentDiv.classList.add("textToAnimate");
          } else {
            //This is just here for troubleshooting
            console.log("Search highlighting has encountered an unusual case.");
          }
        }
      }
      //Nodeintegration safety
      loadHTTPHandlerInIframe();
    }

    //set title to current collection
    remote
      .getCurrentWindow()
      .setTitle(thisAppName + "   ||   " + openthis.collectionName);

    //To avoid successive loads of the iframe from going to the previous serach result verse number, clear out the onload event leaving only the nodeintegration safety.
    setTimeout(() => {
      iframe.onload = () => {
        loadHTTPHandlerInIframe();
      };
    }, 500);
  };
});

//Check for update once on open

ipcRenderer.send("check-for-update", displayLang);
