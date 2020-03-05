const URL = require('url').Url;
const format = require('url').format;
const urlParams = require('url').URLSearchParams;
require('url-search-params-polyfill');

const https = require('https');
let searchString = "queen";
const cardGroup = document.querySelector('.card-group');

//add event listener on the search button
document.querySelector(".search-button").addEventListener('click', newSearch);

//https://itunes.apple.com/search?term=${searchString}&media=music&limit=20
//https://itunes.apple.com/lookup?id=909253&entity=album

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
    ['sort', 'recent']
  ]);
  baseUrl.pathname = '/lookup'
  baseUrl.search = newParams.toString();

  query(baseUrl);

}

function lookUpAlbum(data) {
  if (data.resultCount > 0) {
    //reset the container
    const container = document.querySelector('.card-group');
    container.innerHTML = "";
    data.results.forEach(
      (item) => {
        if (item.wrapperType === "collection") {
          const albumImage = document.createElement("img");
          const albumBody = document.createElement("div");
          const albumText = document.createElement("p");
          const cardContainer = document.createElement("div");
          cardContainer.classList.add("card", "mr-3", "mb-3", "pb-3", "a-" + item.collectionId);

          albumBody.classList.add("card-body");
          albumText.classList.add("card-text", "pt-2");

          albumImage.classList.add("card-img-top");
          albumImage.src = `${item.artworkUrl100}`
          // cardHeader.innerHTML= `${item.collectionName}`;
          albumText.innerHTML =
            `
            <a href="${item.collectionViewUrl}" target="_blank"><br><p>${item.collectionName}</p></a><br>
            <span class="small-text badge badge-pill badge-warning">$</span><p>${item.collectionPrice}</p><br>
            <span class="small-text badge badge-pill badge-warning">Nr. of tracks</span><p>${item.trackCount}</p><br>
            <span class="small-text badge badge-pill badge-warning">Genre</span><p>${item.primaryGenreName}</p><br>
            <span class="small-text badge badge-pill badge-warning ">Release date</span><p class="pb-3">${item.releaseDate.slice(0, 10)}</p><br>
            `
          //
          cardGroup.appendChild(cardContainer);
          cardContainer.appendChild(albumImage);
          cardContainer.appendChild(albumBody);
          albumBody.appendChild(albumText);
          lookUpSongs(item.collectionId);
        }
      });
  }
}

function lookUpSongs(id) {

  let songParams = new URLSearchParams([
    ['id', id],
    ['entity', 'song']
  ]);
  baseUrl.search = songParams.toString();
  query(baseUrl);
}

function songList(songs) {
  let cont_div = document.querySelector(`.a-${songs.results[0].collectionId}`)
  const trackContainer = document.createElement("span");
  trackContainer.classList.add('track-container');
  cont_div.querySelector('.card-text').appendChild(trackContainer);
  let finalTrackNumber = "";
  if (songs.resultCount > 1) {
    let i = 1;
    songs.results.slice(0, 14).forEach(
      (item) => {
        if (item.wrapperType === "collection" && item.collectionPrice !== undefined) {
          finalTrackNumber = item.trackCount;
          return finalTrackNumber;
        }
        else if (item.wrapperType === "track") {
          const tracksList = document.createElement("span");
          tracksList.classList.add("track-list");

          tracksList.innerHTML = `${item.trackNumber}.  ${item.trackName}<br>`;
          //
          let cont = document.querySelector(`.a-${songs.results[0].collectionId}`);
          cont.querySelector('.track-container').appendChild(tracksList);

          if (i >= 13 || item.trackNumber === (finalTrackNumber / item.discNumber)) {
            const audioSpan = document.createElement("span");
            const trackName = document.createElement("span");
            trackName.classList.add("song-name");
            audioSpan.classList.add("audio-track");
            const previewTrack = document.createElement("audio");
            previewTrack.setAttribute("controls", "controls");
            previewTrack.src = `${item.previewUrl}`;
            trackName.innerHTML = `${item.trackName} Song Preview`;
            audioSpan.appendChild(trackName);
            audioSpan.appendChild(previewTrack)
            cont.querySelector('.card-body').appendChild(audioSpan);

          }
          i++;
        }
      });
  } else {
    const tracksList = document.createElement("span");
    tracksList.classList.add("track-list");
    tracksList.innerHTML = "---";
    let cont = document.querySelector(`.a-${songs.results[0].collectionId}`);
    cont.querySelector('.track-container').appendChild(tracksList);
  }
}

///

function query(url) {
  https.get(format(url), (res) => {
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