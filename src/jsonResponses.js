const axios = require('axios');
const urlParser = require('url');
const query = require('querystring');

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const getCardInfo = async (request, response) => {
  const parsedUrl = urlParser.parse(request.url);
  const params = query.parse(parsedUrl.query);

  let url = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?';
  // allow get/head request
  if (request.method === 'GET' || request.method === 'HEAD') {
    const {
      fname, type, num, offset,
    } = params;
    if (!fname || !type) {
      const responseJSON = {
        id: 'badRequest',
        message: 'Missing fname or type query parameter',
      };
      return respondJSON(request, response, 400, responseJSON);
    }
    url = `${url}fname=${fname}&type=${type}&num=${num}&offset=${offset}`;

    try {
      const res = await axios.get(url);
      const { data } = res;
      respondJSON(request, response, 200, data);
    } catch (error) {
      console.error(error.response.status);
      if (error.response.status === 400) {
        const responseJSON = {
          id: 'badRequest',
          message: error.response.data.error,
        };
        return respondJSON(request, response, 400, responseJSON);
      }
      const responseJSON = {
        message: 'Internal Server Error. Something went wrong',
        id: 'internalError',
      };
      return respondJSON(request, response, 500, responseJSON);
    }
  }
  // allow post request
  if (request.method === 'POST') {
    const data = [];
    request.on('data', (chunk) => {
      data.push(chunk);
    });
    request.on('end', async () => {
      const {
        fname, type, num, offset,
      } = JSON.parse(data);
      try {
        const res = await axios.get(url);
        const { data } = res;
        respondJSON(request, response, 200, data);
      } catch (error) {
        console.error(error);
        const responseJSON = {
          message: 'Internal Server Error. Something went wrong',
          id: 'internalError',
        };
        return respondJSON(request, response, 500, responseJSON);
      }
    });
  }
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  getCardInfo,
  notFound,
};
