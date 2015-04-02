define([
    'buffer',
    'dumper'
], function(Buffer, Dumper) {
    return {
        dump: function() {},
        load: function() {},

        dumps: function(obj) {
            var buffer = new Buffer(),
                dumper = new Dumper();

            dumper.dump(obj, buffer);

            return buffer.value;
        },
        loads: function(value) {
            var buffer = new Buffer(value),
                dumper = new Dumper();

            return dumper.undump(buffer);
        }
    };
});