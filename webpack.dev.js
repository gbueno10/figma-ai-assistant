const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  
  // Cache agressivo para desenvolvimento
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  
  // Source maps mais rápidos para debug - inline é mais compatível com Figma
  devtool: 'inline-source-map',
  
  entry: {
    code: './src/code.ts',
    ui: './src/ui.ts'
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            // Transpilação apenas - sem verificação de tipos
            transpileOnly: true,
            // Compilação mais rápida e compatível com Figma
            compilerOptions: {
              sourceMap: true,
              skipLibCheck: true,
              module: 'commonjs',
              target: 'es2017'
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: false, // Não limpa o dist toda vez
    // Configuração crucial para Figma plugins
    library: {
      type: 'commonjs2'
    },
    globalObject: 'this'
  },
  
  // Otimizações para desenvolvimento
  optimization: {
    minimize: false,
    splitChunks: false,
    runtimeChunk: false
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
      inject: false,
      minify: false
    }),
    // Verificação de tipos em paralelo (pode ser desabilitada para mais velocidade)
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true
        },
        mode: 'write-references' // Modo mais rápido
      }
    })
  ]
};
