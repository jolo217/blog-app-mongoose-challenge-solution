const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {DATABASE_URL} = require('../config')
const {Blog} = require('../models');
const {TEST_DATABASE_URL} = require('../config');

const should = chai.should();

chai.use(chaiHttp);

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

function seedBlogData() {
	console.info('seeding blog data');
	const seedData = [];
	for (let i=1; i<=10; i++) {
		seedData.push({
			author: {
				firstName: faker.name.firstName(),
				lastName: fake.name.lastName()
			},
			title: faker.lorem.sentence(),
			content: faker.lorm.text()
		});
	}
	return BlogPost.insertMany(seedData);
}

describe('Restaurants API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  describe('GET endpoint', function() {

  	it('should return all existing blogs', function() {
  		let res;
  		return chai.request(app)
  			.get('/posts')
  			.then(function(_res) {
  				res = _res;
  				res.should.have.status(200);
  				res.body.blogs.should.have.length.of.at.least(1);
  				return Blog.count();
  			})
  			.then(function(count) {
  				res.body.blogs.should.have.length.of(count);
  			});
  	});

  	it('should return blogs with right fields', function() {
  		let resBlog;
  			.get('/posts')
  			.then(function(res) {
  				res.should.have.status(200);
  				res.should.be.json;
  				res.body.blogs.should.be.a('array');
  				res.body.blogs.should.have.a.leength.of.at.least(1);

  				res.body.blogs.forEach(function(blog) {
  					blog.should.be.a('object');
  					blog.should.include.keys(
  						'title', 'author', 'content');
  				});
  				resBlog = res.body.blogs[0];
  				return Blog.findById(resBlog.id);
  			})
  			.then(function(restaurant) {
  				resBlog.title.should.equal(blog.title);
  				resBlog.content.should.equal(blog.content);
  				resBlog.author.should.equal(blog.authorName);
  			});
  	});
  });

  describe('POST endpoint', function() {
  	it('should add a new blog', function() {
  		 const newPost = {
          title: faker.lorem.sentence(),
          author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
          },
          content: faker.lorem.text()
      };
         return chai.request(app)
	        .post('/posts')
	        .send(newPost)
	        .then(function(res) {
	          res.should.have.status(201);
	          res.should.be.json;
	          res.body.should.be.a('object');
	          res.body.should.include.keys(
	            'id', 'title', 'author', 'content');
	          res.body.title.should.equal(newPost.title);
	          res.body.id.should.not.be.null;
	          res.body.author.should.equal(
	            `${newPost.author.firstName} ${newPost.author.lastName}`);
	          res.body.content.should.equal(newPost.content);
	          return Blog.findById(res.body.id);
	        })
	        .then(function(post) {
	          post.title.should.equal(newPost.title);
	          post.content.should.equal(newPost.content);
	          post.author.firstName.should.equal(newPost.author.firstName);
	          post.author.lastName.should.equal(newPost.author.lastName);
        });
    });
  });
  
  describe('PUT endpoint', function() {
  	it('should update fields you sned over', function() {
  		const updateData = {
  			name: 'Persons name',
  			content: 'Trucks Trucks Trucks',
  			author: {
  				firstName: "Billy",
  				lastName: "Jean"
  			}
  		};

  		return Blog
  	 	  .findOne()
  	 	  .then(function(blog) {
  	 	  	updateData.id = blog.id;

  	 	  	return chai.request(app)
  	 	  		.put(`/posts/${blog.id}`)
  	 	  		.send(updateData);
  	 	  })
  	 	  .then(function(res) {
  	 	  	res.should.have.status(204);

  	 	  	return Blog.findById(updateData.id);
  	 	  })
  	 	  .then(function(blog) {
  	 	  	blog.name.should.equal(updateData.name);
  	 	  	blog.content.should.equal(updateData.content);
  	 	  	blog.author.firstName.should.equal(updateData.author.firstName);
          	blog.author.lastName.should.equal(updateData.author.lastName);
  	 	  });
  	});
  });

  describe('DELETE endpoint', function() {
  	it('delete a blog by id', function() {
  		let blog; 

  		return Blog
  		  .findOne()
  		  .then(function(_blog) {
  		  	blog = _blog;
  		  	return chai.request(app).delete(`/posts/${blog.id}`);
  		  })
  		  .then(function(res) {
  		  	res.should.have.status(204);
  		  	return Blog.findById(blog.id);
  		  })
  		  .then(function(_blog) {
  		  	should.not.exist(_blog);
  		  });
  	});
  });
 });
