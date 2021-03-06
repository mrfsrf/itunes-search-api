const URL = require('url').Url;
const format = require('url').format;
const urlParams = require('url').URLSearchParams;
require('url-search-params-polyfill');

const https = require('https');
let searchString = "the misfits";
const cardGroup = document.querySelector('.card-columns');
const searchInput = document.querySelector('.music-search');
const infoText = document.querySelector('.loading');
const searchInputField = document.querySelector('.search-music-artist');
let searchStringTyped = "";
let tick = false;


//add event listener on the search button
document.querySelector(".search-button").addEventListener('click', newSearch);
// document.querySelector(".search-music-artist").addEventListener('input', quickSearch(callQuickSearch, 16)); // implement later
searchInputField.addEventListener('input', function(e) {
  if (!tick) {
    setTimeout(function () {
      customFunction(e);
      tick = false;
    }, 10)
  }
  tick = true;
});

//https://itunes.apple.com/search?term=${searchString}&media=music&limit=20 //artist
//https://itunes.apple.com/lookup?id=120199&entity=album // get albums
//https://itunes.apple.com/lookup?id=1468202477&entity=song  // songs from albums
// album time = 643128 * trackCount * discCount

let baseUrl = new URL('http://example.com'); // we need to define or error
let parameters = new URLSearchParams([
  ['term', `${searchString}`],
  ['media', 'music'],
  ['entity', 'musicArtist'],
  ['limit', '20']
]);

baseUrl.protocol = 'https:';
baseUrl.host = 'itunes.apple.com';
baseUrl.pathname = '/search';
baseUrl.search = parameters.toString();
///

function customFunction(e){
  searchStringTyped = searchInputField.value.trim();
  let huge_list = document.querySelector('.result-list');

  searchInputField.innerHTML = "";
  console.log("input " + searchStringTyped);
  if (searchStringTyped.length === 0) {
    cardGroup.innerHTML = "";
    // infoText.innerHTML = "No Results";
  }
  if (searchStringTyped !== undefined && searchStringTyped.length > 4) {
    // search only artist
    //let apiCall = `https://itunes.apple.com/search?term=${searchStringTyped}&media=music&entity=musicArtist&limit=20`;
    let suggestParameters = new URLSearchParams([
      ['term', `${searchStringTyped}`],
      ['media', 'music'],
      ['entity', 'musicArtist'],
      ['limit', '5']
    ]);
    baseUrl.pathname = '/search';
    baseUrl.search = suggestParameters.toString();
    console.log("bsaseurl " + format(baseUrl));
    // query(baseUrl); 
        // abort any pending requests

        const req =  https.request(format(baseUrl), (res) => {
          let dataTwo = "";
          res.on('data', (d) => {
            // process.stdout.write(d);
            dataTwo += d;
          })

          res.on('end', () => {

            if (res.statusCode === 200) {
            huge_list.innerHTML = "";
            let dataTwoJson =  JSON.parse(dataTwo);
            dataTwoJson.results.forEach(function(item) {
                let option = document.createElement('a');
                option.classList.add('list-group-item', 'list-group-item-action', 'quick-results');
                option.setAttribute('data-toggle', 'list');
                option.setAttribute('role', 'tab');
                option.setAttribute('aria-controls', `${item.artistName}`);
                option.href=`"#${item.artistName}"`;
                // option.value = item.artistName;
                option.innerText = item.artistName;
                // attach the option to the datalist element
                huge_list.appendChild(option);
            });
            dataTwo = "";
          }
          })
        });
                  
        req.on('error', (e) => {
          console.error(e);
        });
        req.end();  
  }
}



function newQuickLink(e) {
  e.preventDefault();
  let targetLink = e.target;
  let searchStringQuery = targetLink.innerText;
  let newQuickSearchParams = new URLSearchParams([
    ['term', `${searchStringQuery}`],
    ['media', 'music'],
    ['entity', 'musicArtist'],
    ['limit', '20']
  ]);
   baseUrl.pathname = '/search';
    baseUrl.search = newQuickSearchParams.toString();
    console.log("baseurl---> " + format(baseUrl));
    query(baseUrl);
    document.querySelector('.result-list').innerHTML = "";
}

document.querySelector('.result-list').addEventListener("click", newQuickLink );

///
function newSearch() {
  const inputElement = document.querySelector(".search-music-artist");
  const text = inputElement.value.trim();

  if (text !== undefined && text.length > 0) {
    searchString = text;
    let inputParameters = new URLSearchParams([
      ['term', `${searchString}`],
      ['media', 'music'],
      ['entity', 'musicArtist'],
      ['limit', '20']
    ]);
    baseUrl.pathname = '/search';
    baseUrl.search = inputParameters.toString();
    query(baseUrl);
  }
  inputElement.value = "";
}

document.querySelector('.current-artist').innerHTML = searchString;

function lookUpArtist(artistId) {

  let newParams = new URLSearchParams([
    ['id', artistId],
    ['entity', 'album'],
    // ['sort', 'recent']
  ]);
  baseUrl.pathname = '/lookup'
  baseUrl.search = newParams.toString();

  query(baseUrl);

}

function lookUpAlbum(data) {
  if (data.resultCount > 0) {
    //reset the container
    const container = document.querySelector('.card-columns');
    container.innerHTML = "";
    document.querySelector('.current-artist').innerHTML = `${data.results[0].artistName}`;
    data.results.forEach(
      (item) => {
        if (item.wrapperType === "collection") {
          const albumImage = document.createElement("img");
          const albumBody = document.createElement("div");
          const albumText = document.createElement("p");
          const cardContainer = document.createElement("div");
          cardContainer.classList.add("card", "mr-3", "mb-3", "pb-3", "lazy-loading", "a-" + item.collectionId);
          cardContainer.style.opacity = 0;
          cardContainer.setAttribute("data-lazy", "true");
          albumBody.classList.add("card-body", "align-top");
          albumText.classList.add("card-text", "pt-2");

          albumImage.classList.add("card-img-top");
          albumImage.src = `${item.artworkUrl100}`
          // cardHeader.innerHTML= `${item.collectionName}`;
          albumText.innerHTML =
            `
            <a href="${item.collectionViewUrl}" target="_blank" class="album-name"><br><h3>${item.collectionName}</h3></a><br>
            <span class="small-text badge badge-pill badge-warning">$</span><p>${item.collectionPrice}</p><br>
            <span class="small-text badge badge-pill badge-warning">Nr. of tracks</span><p>${item.trackCount}</p><br>
            <span class="small-text badge badge-pill badge-warning">Genre</span><p>${item.primaryGenreName}</p><br>
            <span class="small-text badge badge-pill badge-warning ">Release date</span><p>${item.releaseDate.slice(0, 10)}</p><br>
            `
          //
          cardGroup.appendChild(cardContainer);
          // cardContainer.appendChild(albumImage);
          albumBody.appendChild(albumImage);
          cardContainer.appendChild(albumBody);
          albumBody.appendChild(albumText);
          lookUpSongs(item.collectionId);

          const lazyTargets = document.querySelectorAll('.lazy-loading');
          lazyTargets.forEach(lazyLoad);
        }
      });
  }
}

// The lazy loading observer
function lazyLoad(target) {
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.classList.add('fadeIn');
        card.style.opacity = 1;
        observer.disconnect();
      }
    });
  });
  obs.observe(target);
}

function lookUpSongs(id) {

  let songParams = new URLSearchParams([
    ['id', id],
    ['entity', 'song']
  ]);
  baseUrl.search = songParams.toString();
  query(baseUrl);
}

function millisToMinutesAndSeconds(millis, type) {
  let minutes = Math.floor((millis / (1000 * 60)) % 60);
  let hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
  let seconds = ((millis % 60000) / 1000).toFixed(0);

  if (type == "song") {
    seconds = (seconds < 10) ?  `0${seconds}` : `${seconds}`;
    return `${minutes}:${seconds}`;
  } else if (type == "album"){
    hours = (hours < 1) ? "" : `${hours} Hours`;
    minutes = `${minutes} Minutes`;
    return `${hours} ${minutes}`;
  } else {
    console.log("Something went wrong. Type is neither song nor album");
  }
}  


function songList(songs) {
  let cont_div = document.querySelector(`.a-${songs.results[0].collectionId}`)
  const trackContainer = document.createElement("ul");
  trackContainer.setAttribute("type", "1");
  trackContainer.classList.add('track-container', 'list-group');
  // trackContainer.appendChild(tracksListContainer);
  const audioSpan = document.createElement("span");
  audioSpan.classList.add("tracks-preview-container");
  cont_div.appendChild(trackContainer);
  let finalTrackNumber = "";
  let totalMilisTime = 0;

  if (songs.resultCount > 1) {
    // let i = 1;
    songs.results.forEach(
      (item) => {
        if (item.wrapperType === "collection" && item.collectionPrice !== undefined) {
          // finalTrackNumber = item.trackCount;
          finalTrackNumber = item.resultCount-1;
          return finalTrackNumber;
        }
        else if (item.wrapperType === "track") {
          const tracksList = document.createElement("li");
          tracksList.classList.add("track-list", 'list-group-item', "list-group-flush");


          totalMilisTime += item.trackTimeMillis;

          /*
          adding all songs preview from the album
          */

          tracksList.innerHTML = 
          `
          <span class="${item.trackId} track-number">${songs.results.indexOf(item)}</span>
          <span class="song-name">${item.trackName}</span>
          <span class="track-time">${millisToMinutesAndSeconds(item.trackTimeMillis, "song")} /</span>
          <audio class="audio-player" src="${item.previewUrl}" controls controlslist="nodownload">
          </audio>
          `;
          // <button class="${item.trackId}">${songs.results.indexOf(item)}</button>


          trackContainer.appendChild(tracksList);
        }
      });
      console.log(`Album ${songs.results[0].collectionName} and milisecs time: ${millisToMinutesAndSeconds(totalMilisTime, "album")}`);
      // const albumTime = document.createElement("span");
      let albumTime = `<span class="small-text badge badge-pill badge-warning ">Total time</span><p class="pb-3">${millisToMinutesAndSeconds(totalMilisTime, "album")}</p><br>`;
      // cont_div.querySelector('.card-text').appendChild(albumTime);
      cont_div.querySelector('.card-text').innerHTML += albumTime;

      totalMilisTime = 0;

    } else {
    const tracksList = document.createElement("span");
    tracksList.classList.add("track-list");
    tracksList.innerHTML = "---";
    let cont = document.querySelector(`.a-${songs.results[0].collectionId}`);
    cont.querySelector('.track-container').previousElementSibling.appendChild(tracksList);

  }
      // appending audio container at the end
      cont_div.querySelector('.card-body').appendChild(audioSpan);
}
///

function query(url) {
  https.get(format(url), (res) => {
    // let headerContent =  res.headers['content-type'];
    // let headerAccept = res.headers['Accept'];
    // console.log(`headers: Content-type: ${headerContent} and Accept: ${headerAccept}`);
    // console.log('statusCode:', res.statusCode);

    let data = "";
    res.on('data', (d) => {
      data += d;
    })
    res.on('end', () => {
     
      let jsonFile = JSON.parse(data);
      if (url.search.includes("term")) {
        let paramss = new URLSearchParams(url.search);
        // let bla = url.searchParams;
        // console.log("url " + bla);
        // let s_s = url.search.split("&")[0].split("=")[1];
        // s_s = s_s.split("+").join(" ").toLowerCase();
        let s_s = paramss.get("term").toLowerCase();
        // console.log(s_s);

        let result = jsonFile.results.filter(item => {
          if (item.artistName.toLowerCase().includes(s_s)) {
            return item;
          }
        });
        console.log(result[0].artistName + " --- " + result[0].artistId)
        return lookUpArtist(result[0].artistId);

      } else if (url.search.includes("album")) {
        lookUpAlbum(jsonFile);
        data = "";
        jsonFile = "";

      } else if (url.search.includes("song")) {
        songList(jsonFile);
      }
      data = "";
    })

  });

}

query(baseUrl);