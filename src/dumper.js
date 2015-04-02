define([
    'handlers'
], function(handlers) {
    function Dumper() {
        this.init();
    }

    Dumper.prototype.init = function() {
        this.objs            = [];
        this.objs_id         = [];
        this.priorities_objs = [];
        this.obj2state       = {};
        this.obj2newargs     = {};
        this.id2id           = {};
        this.id2obj          = null;
    };

    Dumper.prototype.dump = function(root_obj, s) {
        this.collect(root_obj);
        //self.priorities_objs.sort(_priority_sorter)
        //self.objs.extend([o for (priority, o) in self.priorities_objs])

        s.write("cereal1\n");
        s.write(this.objs.length);
        s.write("\n");

        var i, obj;

        // id2id
        for(i = 0; i < this.objs.length; ++i) {
            obj = this.objs[i];

            if(typeof obj._id == 'undefined') {
                obj._id = ++handlers.lastId;
            }

            this.id2id[obj._id] = i;
        }

        // dump_obj
        for(i = 0; i < this.objs.length; ++i) {
            obj = this.objs[i];

            handlers.byType[handlers.getType(obj)].dump_obj(obj, this, s);
        }

        // dump_data
        for(i = 0; i < this.objs.length; ++i) {
            obj = this.objs[i];

            handlers.byType[handlers.getType(obj)].dump_data(obj, this, s);
        }

        var root_handler = handlers.byType[handlers.getType(root_obj)];

        if(root_handler == null) {
            console.log('Dumper.dump - error: unknown type: %s', handlers.getType(root_obj));
            return null;
        }

        root_handler.dump_ref(root_obj, this, s);
        this.init();
    };

    Dumper.prototype.undump = function(s) {
        var txt = s.read(8);

        if(txt != "cereal1\n") {
            if(txt == "") {
                console.log('Dumper.undump - error: EOF');
                return null;
            } else {
                console.log('Dumper.undump - error: not a cerealizer buffer');
                return null;
            }
        }

        var nb = parseInt(s.readline());

        // retrieve objects
        var obj, i;

        this.id2obj = new Array(nb);

        for(i = 0; i < nb; ++i) {
            var name = s.readline();

            // find handler for object
            var handler = handlers.byName[name];

            if(handler == undefined) {
                console.log('Dumper.undump - error: unknown class/type: %s', name);
                return null;
            }

            // undump object
            obj = handler.undump_obj(this, s);

            if(obj == null) {
                console.log('Dumper.undump - error: unable to undump class/type: %s', name);
                return null;
            }

            this.id2obj[i] = obj;
        }

        for(i = 0; i < nb; ++i) {
            obj = this.id2obj[i];

            handlers.byType[handlers.getType(obj)].undump_data(obj, this, s);
        }

        var r = this.undump_ref(s);

        this.init();
        return r;
    };

    Dumper.prototype.collect = function(obj) {
        var handler = handlers.byType[handlers.getType(obj)];

        if(handler == null) {
            console.log('Dumper.collect - error: unknown type "%s"', handlers.getType(obj));
            return null;
        }

        handler.collect(obj, this);
    };

    Dumper.prototype.undump_ref = function(s) {
        var c = s.read(1);

        switch(c) {
            case 'i': return parseInt(s.readline());
            case 'f': return parseFloat(s.readline());
            case 's': return s.read(parseInt(s.readline()));
            case 'u': return s.read(parseInt(s.readline()));
            case 'r': return this.id2obj[parseInt(s.readline())];
            case 'n': return null;
            case 'b': return Boolean(parseInt(s.read(1)));
            case 'l': return parseInt(s.readline());
            case 'c':
                // return complex numbers as strings
                var line = s.readline();

                // strip off the '\n' character
                return line.substr(0, line.length - 1);
        }

        console.log('Dumper.undump_ref - error: unknown type "%s"', c);
        return null;
    };

    return Dumper;
});