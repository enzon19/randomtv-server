const axios = require('axios');

async function getCover(id, type) {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`);
    const imageByType = {
      "person": "profile",
      "movie":"poster",
      "tv":"poster"
    }
    return 'https://image.tmdb.org/t/p/w600_and_h900_bestv2' + response.data[imageByType[type] + '_path'];
  } catch (error) {
    console.log(error);
    return '/assets/placeholders/thumb/poster-2561df5a41a5cb55c1d4a6f02d6532cf327f175bda97f4f813c18dea3435430c.png';
  }
}

function getRandomItem(items) {
  const luckNumber = Math.floor(Math.random() * items.length);
  return items[luckNumber];
}

function pickItem(data, res) {
  const username = data.username;
  const listId = data.list_id;
  const type = data.type;
  const isWatchlist = data.is_watchlist;
  
  const urls = [`https://api.trakt.tv/users/${username}/lists/${listId}/items/${type}`, `https://api.trakt.tv/users/${username}/watchlist/${type}/rank`];
  
  axios.get(urls[isWatchlist], {
    headers: { 
      'trakt-api-version': '2', 
      'trakt-api-key': process.env.TRAKT_API_KEY
    }
  })
  .then(async (traktData) => {
    if (traktData.status == 200 && traktData.data.length) {
      let finalObject = {
        "title": "",
        "subtitle": "",
        "url": "",
        "cover": ""
      };
      const pickedItem = getRandomItem(traktData.data);
      
      switch (pickedItem.type) {
        case 'movie':
          finalObject.title = pickedItem.movie.title;
          finalObject.url = "/movies/" + pickedItem.movie.ids.slug;
          finalObject.cover = await getCover(pickedItem.movie.ids.tmdb, 'movie');
          break;
        case 'show':
          finalObject.title = pickedItem.show.title;
          finalObject.url = "/shows/" + pickedItem.show.ids.slug;
          finalObject.cover = await getCover(pickedItem.show.ids.tmdb, 'tv');
          break;
        case 'season':
          finalObject.title = "Season " + pickedItem.season.number;
          finalObject.subtitle = pickedItem.show.title;
          finalObject.url = `/shows/${pickedItem.show.ids.slug}/seasons/${pickedItem.season.number}`;
          finalObject.cover = await getCover(`${pickedItem.show.ids.tmdb}/season/${pickedItem.season.number}`, 'tv'); // cover should be season's cover
          break;
        case 'episode':
          finalObject.title = `${pickedItem.episode.season}x${pickedItem.episode.number} - ${pickedItem.episode.title}`;
          finalObject.subtitle = pickedItem.show.title;
          finalObject.url = `/shows/${pickedItem.show.ids.slug}/seasons/${pickedItem.episode.season}/episodes/${pickedItem.episode.number}`;
          finalObject.cover = await getCover(pickedItem.show.ids.tmdb, 'tv');
          break;
        case 'person':
          finalObject.title = pickedItem.person.name;
          finalObject.url = "/people/" + pickedItem.person.ids.slug;
          finalObject.cover = await getCover(pickedItem.person.ids.tmdb, 'person');
          break;
      }
      
      res.send(finalObject); //traktData.data
    } else {
      res.sendStatus(404);
    }
  })
  .catch(traktError => {
    console.log(traktError)
    res.sendStatus(traktError.response?.status || 404);
  });
}

module.exports = {pickItem};