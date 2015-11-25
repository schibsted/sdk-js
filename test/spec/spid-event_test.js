'use strict';

describe('SPiD.Event', function() {
    var spidEvent  = require('../../src/spid-event');

    it('SPiD.Event.subscribe once and fire', function(done) {
        var data = { test: true, str: 'val' };
        spidEvent.subscribe('custom.event1', function(d) {
            if (d.test && d.str === data.str) {
                done();
            } else {
                done(new Error('Data returned does not match'));
            }
        });
        spidEvent.fire('custom.event1', data);
    });

    it('SPiD.Event.subscribe twice and fire', function(done) {
        var data = { test: true, str: 'val' };
        var count = 0;
        var cb = function() {
            count++;
            if (count === 2) {
                done();
            }
        };
        spidEvent.subscribe('custom.event2', function() {
            cb();
        });
        spidEvent.subscribe('custom.event2', function() {
            cb();
        });
        spidEvent.fire('custom.event2', data);
    });

    it('SPiD.Event.unsubscribe and fire', function(done) {
        var data = { test: true, str: 'val' };
        var cb = function() {
            done(new Error('Callback called even though unsubscribed'));
        };
        spidEvent.subscribe('custom.event2', cb);
        spidEvent.unsubscribe('custom.event2', cb);
        spidEvent.fire('custom.event2', data);
        spidEvent.subscribe('custom.event3', function() {
            done();
        });
        spidEvent.fire('custom.event3', data);
    });
});
