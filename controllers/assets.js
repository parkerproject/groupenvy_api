// This is the assets controller. Goal is to serve css, js, partials, images, or bower packages.
module.exports = {
  images: {
    handler: {
      directory: {
        path: './public/images'
      }
    },
    app: {
      name: 'images'
    }
  },
  css: {
    handler: {
      directory: {
        path: './public/css'
      }
    },
    app: {
      name: 'css'
    }
  },
  js: {
    handler: {
      directory: {
        path: './public/js'
      }
    },
    app: {
      name: 'js'
    }
  },
  video: {
    handler: {
      directory: {
        path: './public/video'
      }
    },
    app: {
      name: 'video'
    }
  }
};