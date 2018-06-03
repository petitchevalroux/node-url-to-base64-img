#  url-to-base64-img

Convert images url to base64 datauri in html
## Install
```
npm install @petitchevalroux/url-to-base64-img
```

## Usage
### Example code
```
const Converter = require("@petitchevalroux/url-to-base64-img");
    converter = new Converter();
    converter.replace("<img src=\"https://example.com/img/1\">")
    .then(html=>{
        console.log(html);
    });
```

### Output

```
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==">
```