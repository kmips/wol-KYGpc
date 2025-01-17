//To customize this app, you should be able to add all the information you need here.

//For each HTML collection, add the following. Delete any extra entries or copy and paste to add.
var collections = [
  {
    name: "Kàddug Yàlla", //the name of the collection
    icon: "bookmark", //the Material icon to use. Go to https://fontdrop.info/ and drop the MaterialIcons font in the HTML folder.
    //Check which icon you want to use, and note the unicode character. You can directly use the unicode
    //character like this: icon: "&#xE031;", or you can look up the name of the icon in the MaterialIcons.txt
    //file in the HTML folder and grab the name there.
    folder: "org.mbs.kyg.wol", //The folder in the HTML folder in which this collection is found.
    fileToView: "index.html", //The first file to view on a new install - usually index.html but not necessarily.
    searchFont: "CharisSILCompact-R.ttf", //The name of a font in the HTML folder for displaying search results.
    searchFontSize: 16, //Size for search results in px.
    textDirection: "ltr",
    horizontalLineFollows: false, //If you want a horizontal line following this entry, put true.
  },
  {
    name: "Injiil 2020",
    icon: "add_circle",
    folder: "org.mbs.kyg.wol.2020",
    fileToView: "index.html",
    searchFont: "CharisSILCompact-R.ttf",
    searchFontSize: 16,
    textDirection: "ltr",
    horizontalLineFollows: false,
  },
  {
    name: "ڪَدُّگْ يَلَّ گِ",
    icon: "polymer",
    folder: "org.mbs.kygma.wol",
    fileToView: "index.html",
    searchFont: "Harmattan-Regular.ttf",
    searchFontSize: 24,
    textDirection: "rtl",
    horizontalLineFollows: true,
  },
  {
    name: "Ab Jukki",
    icon: "format_align_left",
    folder: "org.mbs.chrono.wol.alfa",
    fileToView: "index.html",
    searchFont: "CharisSILCompact-R.ttf",
    searchFontSize: 16,
    textDirection: "ltr",
    horizontalLineFollows: false,
  },
  {
    name: "اَبْ جُڪِّ",
    icon: "format_align_right",
    folder: "org.mbs.chrono.wol.ajami",
    fileToView: "index.html",
    searchFont: "Harmattan-Regular.ttf",
    searchFontSize: 24,
    textDirection: "rtl",
    horizontalLineFollows: false,
  },
];

var myTranslations = {
  langName: {
    //The name of the language in that language
    en: "English",
    fr: "Français",
    wo: "Wolof",
  },
  menuLangSwitch: {
    //The menu item that invites the user to change languages
    en: "Language",
    fr: "Langue d'interface",
    wo: "Làmmiñu diisookaay bi",
  },
  invToOpen: {
    //The invitation to open the second window, e.g. "One Pane" "Two Pane":
    en: "Two Panes",
    fr: "Deux Volets",
    wo: "Ñaari laf",
  },
  invToClose: {
    en: "One Pane",
    fr: "Un Volet",
    wo: "Wenn laf",
  },
  giveFeedback: {
    //If this is empty, then there will be no feedback button.
    //Make sure it looks like this if you want the button:
    //en: 'Feedback',
    //or like this if you want no feedback button:
    //en: '',
    en: "Feedback",
    fr: "Feedback",
    wo: "Feedback",
  },
  giveFeedbacksubject: {
    //the subject line to include automatically in any feedback email.
    en: "Feedback on KYG desktop app",
    fr: "Feedback sur KYG appli pour ordinateur",
    wo: "Feedback sur KYG appli pour ordinateur",
  },
  menuZoomIn: {
    en: "Zoom +",
    fr: "Zoom +",
    wo: "Zoom +",
  },
  menuZoomOut: {
    en: "Zoom -",
    fr: "Zoom -",
    wo: "Zoom -",
  },
  menuResetZoom: {
    en: "Zoom 100%",
    fr: "Zoom 100%",
    wo: "Zoom 100%",
  },
  menuCopy: {
    en: "Copy",
    fr: "Copier",
    wo: "Copier",
  },
  menuPaste: {
    en: "Paste",
    fr: "Coller",
    wo: "Coller",
  },
  menuSelectAll: {
    en: "Select All",
    fr: "Sélectionner tout",
    wo: "Sélectionner tout",
  },
  menutoggleDevTools: {
    en: "Open DevTools",
    fr: "Outils de développement",
    wo: "Jumtukaayi appli bi",
  },
  menuWebsite: {
    //The text prompt on the option to open the website. Note the URL is below in otherText.
    en: "More on the web",
    fr: "Notre site web",
    wo: "Xoolal sunu ëttu internet",
  },

  menuOpenAboutWin: {
    en: "Copyright && license",
    fr: "Copyright && license",
    wo: "Copyright && license",
  },

  menuSearch: {
    en: "Search",
    fr: "Rechercher",
    wo: "Gëstu",
  },

  menuQuit: {
    en: "Quit",
    fr: "Quitter",
    wo: "Ub",
  },
  searchFuzzy: {
    en: "Fuzzy search",
    fr: "Recherche floue",
    wo: "Recherche floue",
  },
  searchStrict: {
    en: "Strict search",
    fr: "Recherche stricte",
    wo: "Recherche stricte",
  },
  updaterTitle: {
    en: "Update available",
    fr: "Mise à jour disponible",
    wo: "Mise à jour disponible",
  },
  updaterInvToDownload: {
    en: "A new version is available. Do you want to download it now?",
    fr:
      "Une nouvelle version de cette application est disponible. Voulez-vous la mettre à jour maintenant ?",
    wo:
      "Une nouvelle version de cette application est disponible. Voulez-vous la mettre à jour maintenant ?",
  },
  updaterInvToInstall: {
    en:
      "The new version has downloaded. Do you want to quit and install it now?",
    fr:
      "Une nouvelle version de cette application est prête. Quitter et installer maintenant ?",
    wo:
      "Une nouvelle version de cette application est prête. Quitter et installer maintenant ?",
  },

  // buttons: ["Mettre à jour", "Non"],
};

var otherText = {
  //These are text strings that do not change with translations
  thisAppName: "Kàddug Yàlla gi", //The name that you want to use in the app title bar etc.
  menuWebURL: "https://sng.al/app", //The URL for 'visit our website'. Leave empty if you have no website.
  giveFeedbackemail: "equipedevmbs@gmail.com", //the email address to which a user can send feedback
  defaultFont: "Harmattan-Regular.ttf", //A font in the HTML folder that can handle gracefully all scripts in your app;
  //used where the names of all collections are shown side-by-side
  defaultLang: "fr", //The language code that the app should be initially opened in
};

module.exports.collections = collections;
module.exports.myTranslations = myTranslations;
module.exports.otherText = otherText;
