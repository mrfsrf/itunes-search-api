const URL = require('url').Url;
const format = require('url').format;
const urlParams = require('url').URLSearchParams;
require('url-search-params-polyfill');

const https = require('https');
let searchString = "the misfits";
const cardGroup = document.querySelector('.card-group');

//add event listener on the search button
document.querySelector(".search-button").addEventListener('click', newSearch);

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

/* playing song preview handle */

function playSong(id){
  // const trackId = id;
  /*
  Code goes here
  */
  const player = document.querySelector(`.track-${id}`);
  console.log(player);
//  if(id){ 
//     player = document.querySelector(`.track-${id}`);
//     console.log(player);
//   } else {
//     console.log("something is worong");
//   }

// if(player) {
//   stopOtherPlayers();
//   player.play()
// }

function stopOtherPlayers(){
  const players = document.querySelectorAll('.audio-track audio');
  for (let i = 0; i < players.length; i++) {
    players[i].pause();
  }
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
    // console.log('headers:', res.headers);
  

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