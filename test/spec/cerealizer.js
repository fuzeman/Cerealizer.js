define(['cerealizer', 'chai'], function(Cerealizer, chai) {
    var should = chai.should();

    describe('Cerealizer', function () {
        describe('#dumps', function() {
            it('should encode boolean', function () {
                Cerealizer.dumps(true)
                    .should.equal('cereal1\n0\nb1');

                Cerealizer.dumps(false)
                    .should.equal('cereal1\n0\nb0');
            });

            it('should encode float', function () {
                Cerealizer.dumps(5.35)
                    .should.equal('cereal1\n0\nf5.35\n');
            });

            it('should encode integer', function () {
                Cerealizer.dumps(100)
                    .should.equal('cereal1\n0\ni100\n');
            });

            it('should encode list', function () {
                Cerealizer.dumps(['abc', 123, true, false])
                    .should.equal('cereal1\n1\nlist\n4\ns3\nabci123\nb1b0r0\n');
            });

            it('should encode long', function () {
                Cerealizer.dumps(2147483648)
                    .should.equal('cereal1\n0\nl2147483648L\n');
            });

            it('should encode null', function () {
                Cerealizer.dumps(null)
                    .should.equal('cereal1\n0\nn');
            });

            it('should encode object', function () {
                Cerealizer.dumps({
                    'b': true,
                    'f': 5.34,
                    'i': 1,
                    'l': 2147483648,
                    'n': null,
                    's': 'abc',
                    'u': undefined
                }).should.equal(
                    'cereal1\n1\ndict\n7\nb1s1\nbf5.34\ns1\nfi1\ns1\nil2147483648L\ns1\nlns1\nns3\nabcs1\nsns1\nur0\n'
                )
            });

            it('should encode string', function () {
                Cerealizer.dumps('abc')
                    .should.equal('cereal1\n0\ns3\nabc');
            });

            it('should encode undefined', function () {
                Cerealizer.dumps(undefined)
                    .should.equal('cereal1\n0\nn');
            });
        });

        describe('#loads', function() {
            it('should decode boolean', function () {
                Cerealizer.loads('cereal1\n0\nb1')
                    .should.equal(true);

                Cerealizer.loads('cereal1\n0\nb0')
                    .should.equal(false);
            });

            it('should decode complex', function () {
                Cerealizer.loads('cereal1\n0\nc5j\n')
                    .should.equal('5j');
            });

            it('should decode dict', function () {
                Cerealizer.loads('cereal1\n1\ndict\n7\nb1s1\nbf5.34\ns1\nfi1\ns1\nil2147483648L\ns1\nlns1\nns3\nabcs1\nsns1\nur0\n')
                    .should.deep.equal({
                        'b': true,
                        'f': 5.34,
                        'i': 1,
                        'l': 2147483648,
                        'n': null,
                        's': 'abc',
                        'u': null
                    });
            });

            it('should decode float', function () {
                Cerealizer.loads('cereal1\n0\nf5.35\n')
                    .should.equal(5.35);
            });

            it('should decode frozenset', function () {
                Cerealizer.loads('cereal1\n1\nfrozenset\n3\ni1\ni2\ni3\nr0\n')
                    .should.deep.equal([1,2,3]);
            });

            it('should decode integer', function () {
                Cerealizer.loads('cereal1\n0\ni100\n')
                    .should.equal(100);
            });

            it('should decode list', function () {
                Cerealizer.loads('cereal1\n1\nlist\n4\ns3\nabci123\nb1b0r0\n')
                    .should.deep.equal(['abc', 123, true, false]);
            });

            it('should decode long', function () {
                Cerealizer.loads('cereal1\n0\nl2147483648L\n')
                    .should.equal(2147483648);
            });

            it('should decode None', function () {
                should.equal(
                    Cerealizer.loads('cereal1\n0\nn'),
                    null
                );
            });

            it('should decode set', function () {
                Cerealizer.loads('cereal1\n1\nset\n3\ni1\ni2\ni3\nr0\n')
                    .should.deep.equal([1, 2, 3]);
            });

            it('should decode string', function () {
                Cerealizer.loads('cereal1\n0\ns3\nabc')
                    .should.equal('abc');
            });

            it('should decode tuple', function () {
                Cerealizer.loads('cereal1\n1\ntuple\n3\ni1\ni2\ni3\nr0\n')
                    .should.deep.equal([1, 2, 3]);
            });

            it('should decode unicode', function () {
                // test actual unicode data
                Cerealizer.loads('cereal1\n0\nu3\nabc')
                    .should.equal('abc');
            });
        });
    });
});