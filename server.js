var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();

app.use('/api', proxy({
    target: 'http://api.ppssii.com',
    changeOrigin: true,
}))





app.listen(3000, () => {
    console.log('node代理启动成功,端口3000');
});
