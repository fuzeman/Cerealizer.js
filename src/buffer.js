define([], function(){
    function Buffer(value) {
        this.value = value || '';
        this.position = 0;
    }

    Buffer.prototype.read = function(n) {
        var value = this.value.substr(this.position, n);

        this.position += n;
        return value;
    };

    Buffer.prototype.readline = function() {
        var end = this.value.indexOf('\n', this.position);

        if(end == -1) {
            end = this.value.length;
        } else {
            end += 1;
        }

        var length = end - this.position,
            line = this.value.substr(this.position, length);

        this.position += length;
        return line;
    };

    Buffer.prototype.write = function(value) {
        if(typeof value !== "string") {
            value = value.toString();
        }

        this.value += value;
        this.position += value.length;
    };

    return Buffer;
});