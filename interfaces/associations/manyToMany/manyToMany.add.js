var Waterline = require('waterline'),
    Taxi = require('../support/manyToMany.taxi.fixture'),
    Driver = require('../support/manyToMany.driver.fixture'),
    assert = require('assert');

describe.skip('Association Interface', function() {

  /////////////////////////////////////////////////////
  // TEST SETUP
  ////////////////////////////////////////////////////

  var customerModel, paymentModel;

  before(function(done) {
    var waterline = new Waterline();

    waterline.loadCollection(Taxi);
    waterline.loadCollection(Driver);

    waterline.initialize({ adapters: { test: Adapter }}, function(err, collections) {
      if(err) return done(err);

      customerModel = collections.customermany;
      paymentModel = collections.paymentmany;

      done();
    });
  });


  describe('Many To Many Association', function() {

    describe('association .add()', function() {

      describe('with an object', function() {

        /////////////////////////////////////////////////////
        // TEST SETUP
        ////////////////////////////////////////////////////

        var customer;

        before(function(done) {
          customerModel.create({ name: 'manymany add' })
          .exec(function(err, model) {
            if(err) return done(err);
            customer = model;
            done();
          });
        });

        /////////////////////////////////////////////////////
        // TEST METHODS
        ////////////////////////////////////////////////////

        it('should create a new payment association', function(done) {

          customer.payments.add({ amount: 1337 });

          customer.save(function(err) {
            if(err) return done(err);

            // Look up the customer again to be sure the payment was added
            customerModel.findOne(customer.id)
            .populate('payments')
            .exec(function(err, customer) {
              if(err) return done(err);

              assert(customer.payments.length === 1);
              assert(customer.payments[0].amount === 1337);

              done();
            });
          });
        });
      });

      describe('with an id', function() {

        /////////////////////////////////////////////////////
        // TEST SETUP
        ////////////////////////////////////////////////////

        var customer, payment;

        before(function(done) {
          customerModel.create({ name: 'manymany add' })
          .exec(function(err, model) {
            if(err) return done(err);
            customer = model;

            paymentModel.create({ amount: 20 })
            .exec(function(err, pmt) {
              if(err) return done(err);
              payment = pmt;
              done();
            });
          });
        });

        /////////////////////////////////////////////////////
        // TEST METHODS
        ////////////////////////////////////////////////////

        it('should link a payment to a customer through a join table', function(done) {

          customer.payments.add(payment.id);

          customer.save(function(err) {
            if(err) return done(err);

            // Look up the customer again to be sure the payment was added
            customerModel.findOne(customer.id)
            .populate('payments')
            .exec(function(err, data) {
              if(err) return done(err);

              assert(data.payments.length === 1);
              assert(data.payments[0].amount === 20);
              done();
            });
          });
        });
      });

    });
  });
});