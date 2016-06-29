'use strict';

const Hapi = require('hapi');
const Boom = require('boom');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000
});

let contents = {};

// Create a new item of type {category}
server.route({
    method: 'POST',
    path: '/api/{category}', 
    handler: function (request, reply) {
        let body = request.payload;
        let category = request.params.category;

        if (!contents.hasOwnProperty(category)) {
            contents[category] = [];
        }

        contents[category].push(body);
        body.id = contents[category].findIndex(x => x === body);

        return reply(body);
    }
});

server.route({
    method: 'GET',
    path:'/api/{category}/latest',
    handler: function (request, reply) {
        let category = request.params.category;

        if (!contents.hasOwnProperty(category)) return reply(Boom.notFound('Unknown entity type'));
        if (contents[category].length === 0) return reply(Boom.notFound('No entities available'));

        let lastIndex = contents[category].length - 1;
        return reply(contents[category][lastIndex]);
    }
});

server.route({
    method: 'GET',
    path:'/api/{category}/{index}', 
    handler: function (request, reply) {
        let category = request.params.category;
        let index = request.params.index;

        if (!contents.hasOwnProperty(category)) return reply(Boom.notFound('Unknown entity type'));
        if (index >= contents[category].length) return reply(Boom.notFound('Entity doesn\'t exist'));

        return reply(contents[category][index]);
    }
});

// Start the server
server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});