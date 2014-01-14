/*global describe:false*/
/*global it:false*/
/*global SPiD:false*/

describe('SPiD.Event', function() {

    it('SPiD.Event.subscribe once and fire', function(done) {
        var data = {test:true, str:'val'};
        SPiD.Event.subscribe('custom.event1', function(d) {
            if(d.test && d.str === data.str) {
                done();
            } else {
                done(new Error('Data returned does not match'));
            }
        });
        SPiD.Event.fire('custom.event1', data);
    });

    it('SPiD.Event.subscribe twice and fire', function(done) {
        var data = {test:true, str:'val'};
        var count = 0;
        var cb = function() {
            count++;
            if(count === 2) {
                done();
            }
        };
        SPiD.Event.subscribe('custom.event2', function() {
            cb();
        });
        SPiD.Event.subscribe('custom.event2', function() {
            cb();
        });
        SPiD.Event.fire('custom.event2', data);
    });

    it('SPiD.Event.unsubscribe and fire', function(done) {
        var data = {test:true, str:'val'};
        var cb = function() {
            done(new Error('Callback called even though unsubscribed'));
        };
        SPiD.Event.subscribe('custom.event2', cb);
        SPiD.Event.unsubscribe('custom.event2', cb);
        SPiD.Event.fire('custom.event2', data);

        SPiD.Event.subscribe('custom.event2', function() {
            done();
        });
        SPiD.Event.fire('custom.event2', data);
    });
});