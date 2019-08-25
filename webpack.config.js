// webpack.config.js
module.exports = {
    entry: [
      './src/index.js',
      './src/index.css'
    ],
    output: {
      path: __dirname,
      publicPath: '/',
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "script-loader"
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: "style-loader"
            },
            {
              loader: "css-loader",
              options: {
                modules: {
                    mode: 'local',
                    localIdentName: "[name]_[local]_[hash:base64]",
                },
                importLoaders: 1,
                sourceMap: true,
              }
            }
          ]
        }
      ]
    }
  };