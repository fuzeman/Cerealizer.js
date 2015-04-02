define([], function() {
    var handlers = {
        byName: {},
        byType: {},
        lastId: 0,

        getType: function(instance) {
            var name = Object.prototype.toString.call(instance);

            return name.substr(8, name.length - 9);
        }
    };

    function register(type, handler) {
        if(typeof type !== "string") {
            type = handlers.getType(type);
        }

        handlers.byName[handler.name] = handler;
        handlers.byType[type] = handler;
    }

    //
    // Base
    //

    var Handler = {
        collect: function(obj, dumper) {
            if(typeof obj._id == 'undefined') {
                obj._id = ++handlers.lastId;
            }

            if(dumper.objs_id.indexOf(obj._id) == -1) {
                dumper.objs.push(obj);
                dumper.objs_id.push(obj._id);
                return true;
            }

            return false;
        },

        dump_obj: function(obj, dumper, s) {
            s.write(this.name);
        },

        dump_ref: function(obj, dumper, s) {
            s.write('r');
            s.write(dumper.id2id[obj._id]);
            s.write('\n');
        }
    };

    //
    // Collections
    //

    function object_count(obj) {
        var count = 0;

        for(var key in obj) {
            if (!obj.hasOwnProperty(key) || key == '_id') {
                break;
            }

            ++count;
        }

        return count;
    }

    register({}, {
        name: 'dict\n',
        type: 'class',

        dump_obj: Handler.dump_obj,
        dump_ref: Handler.dump_ref,

        collect: function(obj, dumper) {
            if(Handler.collect(obj, dumper)) {
                var key;

                for(key in obj) {
                    if (!obj.hasOwnProperty(key) || key == '_id') {
                        break;
                    }

                    dumper.collect(key);
                }

                for(key in obj) {
                    if (!obj.hasOwnProperty(key) || key == '_id') {
                        break;
                    }

                    dumper.collect(obj[key]);
                }

                return true;
            }

            return false;
        },

        dump_data: function(obj, dumper, s) {
            s.write(object_count(obj));
            s.write('\n');

            for(var key in obj) {
                if (!obj.hasOwnProperty(key) || key == '_id') {
                    break;
                }

                var value = obj[key];

                handlers.byType[handlers.getType(value)].dump_ref(value, dumper, s);
                handlers.byType[handlers.getType(key)].dump_ref(key, dumper, s);
            }
        },

        undump_obj: function(dumper, s) {
            return {};
        },
        undump_data: function(obj, dumper, s) {
            var length = parseInt(s.readline());

            for(var i = 0; i < length; ++i) {
                var value = dumper.undump_ref(s),
                    key = dumper.undump_ref(s);

                obj[key] = value;
            }
        }
    });

    var ListHandler = {
        name: 'list\n',
        type: 'class',

        dump_obj: Handler.dump_obj,
        dump_ref: Handler.dump_ref,

        collect: function(obj, dumper) {
            if(Handler.collect(obj, dumper)) {
                for(var i = 0; i < obj.length; ++i){
                    dumper.collect(obj[i]);
                }

                return true;
            }

            return false;
        },

        dump_data: function(obj, dumper, s) {
            s.write(obj.length);
            s.write('\n');

            for(var i = 0; i < obj.length; ++i) {
                var o = obj[i];

                handlers.byType[handlers.getType(o)].dump_ref(o, dumper, s);
            }
        },

        undump_obj: function(dumper, s) {
            return [];
        },
        undump_data: function(obj, dumper, s) {
            var length = parseInt(s.readline());

            for(var i = 0; i < length; ++i) {
                obj.push(dumper.undump_ref(s));
            }
        }
    };

    register([], ListHandler);

    register('frozenset', {
        name: 'frozenset\n',
        type: 'class',

        dump_obj: Handler.dump_obj,
        dump_ref: Handler.dump_ref,

        collect: ListHandler.collect,
        dump_data: ListHandler.dump_data,

        undump_obj: ListHandler.undump_obj,
        undump_data: ListHandler.undump_data
    });

    register('set', {
        name: 'set\n',
        type: 'class',

        dump_obj: Handler.dump_obj,
        dump_ref: Handler.dump_ref,

        collect: ListHandler.collect,
        dump_data: ListHandler.dump_data,

        undump_obj: ListHandler.undump_obj,
        undump_data: ListHandler.undump_data
    });

    register('tuple', {
        name: 'tuple\n',
        type: 'class',

        dump_obj: Handler.dump_obj,
        dump_ref: Handler.dump_ref,

        collect: ListHandler.collect,
        dump_data: ListHandler.dump_data,

        undump_obj: ListHandler.undump_obj,
        undump_data: ListHandler.undump_data
    });

    //
    // Types
    //

    register('Boolean', {
        type: 'reference',

        collect: function(obj, dumper) {},
        dump_obj: function(obj, dumper, s) {},
        dump_data: function(obj, dumper, s) {},

        dump_ref: function(obj, dumper, s) {
            s.write('b');
            s.write(obj ? 1 : 0);
        }
    });

    register('Null', {
        type: 'reference',

        collect: function(obj, dumper) {},
        dump_obj: function(obj, dumper, s) {},
        dump_data: function(obj, dumper, s) {},

        dump_ref: function(obj, dumper, s) {
            s.write('n');
        }
    });

    register('Number', {
        type: 'reference',

        collect: function(obj, dumper) {},
        dump_obj: function(obj, dumper, s) {},
        dump_data: function(obj, dumper, s) {},

        dump_ref: function(obj, dumper, s) {
            if(obj % 1 > 0) {
                // float
                s.write('f');
                s.write(obj);
            } else if(obj > 2147483647) {
                // long
                s.write('l');
                s.write(obj);
                s.write('L')
            } else {
                // integer
                s.write('i');
                s.write(obj);
            }
            s.write('\n');
        }
    });

    register('String', {
        type: 'reference',

        collect: function(obj, dumper) {},
        dump_obj: function(obj, dumper, s) {},
        dump_data: function(obj, dumper, s) {},

        dump_ref: function(obj, dumper, s) {
            s.write('s');
            s.write(obj.length);
            s.write('\n');

            s.write(obj);
        }
    });

    register('Undefined', {
        type: 'reference',

        collect: function(obj, dumper) {},
        dump_obj: function(obj, dumper, s) {},
        dump_data: function(obj, dumper, s) {},

        dump_ref: function(obj, dumper, s) {
            s.write('n');
        }
    });

    return handlers;
});