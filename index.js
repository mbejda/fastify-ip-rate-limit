const Fastify = require('fastify');


function server () {
    const fastify = Fastify();

    // to make this configurable we need attach it to the server.
    this.rateConfig = Object.assign({
        max: 10,
        timeWindow: '1 minute',
        skipOnError: false,
        keyGenerator: function(req) {
            const key = `${req.raw.ip}:${req.raw.originalUrl}`;
            return key;
        }
    },this.newRateConfig || {});


    fastify.addHook('onSend', (request, reply, payload, next) => {
        /// AC requirements ask for 401 status code.
        if(reply.res.statusCode === 429){
            payload = JSON.stringify({message: 'To many requests'});
            reply.code(401);
        }
        next(null, payload)
    });


    fastify.register(require('fastify-rate-limit'), this.rateConfig);

    fastify.get('/*', (req, reply) => {
        reply.send({ hello: 'world' })
    });


    fastify.listen(3000, err => {
        if (err) {
            fastify.log.error(err)
            process.exit(1)
        }
        console.log('Server listening at http://localhost:3000')
    });
    return fastify
}


if (!module.parent) {
    const app = server();
}


module.exports = server;



