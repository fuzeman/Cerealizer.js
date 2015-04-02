define(['buffer'], function(Buffer) {
   describe('Buffer', function() {
       it('should return the first 5 characters', function() {
           var b = new Buffer('abcdefgh');

           b.read(5).should.equal('abcde');
       });

       it('should write characters into buffer', function() {
           var b = new Buffer('123');
           b.value.should.equal('123');

           b.write('abcde');
           b.value.should.equal('123abcde');
       });

       it('should read lines from buffer', function() {
           var b = new Buffer('abc\n123\n\n456');

           b.readline().should.equal('abc\n');
           b.readline().should.equal('123\n');
           b.readline().should.equal('\n');
           b.readline().should.equal('456');
       })
   });
});