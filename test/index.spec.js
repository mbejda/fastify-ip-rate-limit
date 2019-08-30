const supertest = require('supertest');
const chai = require('chai');
const Fastify = require('../index');





describe('GET /*', async() => {


    before(async () => {
        server = Fastify.call().server;
    });

    after(async () => {
        server.close();
    });


    const burst = 15;
    it('should receive status 401 for route /', async() => {
        const statusCodes = {
            200 : 0,
            401 : 0
        };
        for (let i = 0; i < burst; i++){
            const response = await supertest(server).get('/');
            statusCodes[response.statusCode]++;
        }
            chai.expect(statusCodes[200]).to.equal(10);
            chai.expect(statusCodes[401]).to.equal(5);
    });


    it('should receive status 200 for all routes', async() => {

        /// create arbitrary random base to increment.
        let base = Math.floor(Math.random() * 1001);

        const statusCodes = {
            200 : 0,
            401 : 0
        };
        for (let i = 0; i < burst; i++){
            base++;
            const response = await supertest(server).get(`/${base}`);
            statusCodes[response.statusCode]++;
        }
        chai.expect(statusCodes[200]).to.equal(15);
        chai.expect(statusCodes[401]).to.equal(0);
    });
});

describe('GET /* timeout', function() {

    before(async () => {
        server = Fastify.call({
            newRateConfig : {
                max: 1,
                timeWindow: '5 seconds',
            }
        }).server;
    });

    after(async () => {
        server.close();
    });

    const burst = 3;
    it('should get status 401 and after 5 seconds status 200', async() => {
        const statusCodes = {
            200 : 0,
            401 : 0
        };
        for (let i = 0; i < burst; i++){
            const response = await supertest(server).get('/timewindow');
            statusCodes[response.statusCode]++;
        }

        const wait = new Promise(resolve => {
            setTimeout(() => resolve('promise resolved'), 5000)
        });
        await wait;

        const response = await supertest(server).get('/timewindow');
        statusCodes[response.statusCode]++;
        chai.expect(statusCodes[200]).to.equal(2);
        chai.expect(statusCodes[401]).to.equal(2);
    }).timeout(8000)

});
