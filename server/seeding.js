let arr =[]
let tags = ['veggie','meat','fast-food','carbohydrates','fruits','fast-food']
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
for(let i=0;i<30;i++){
    tagsArr = []
    for(let t=0;t<3;t++){
        tagsArr.push(tags[getRandomInt(0,5)])
    }
    arr.push({
        'topic': `hey there number ${i}`,
        'text': 'hey!!',
        'author': '5f421c74567b7632208d02eb',
        "created": "2020-08-23T07:36:37.914Z",
        'tags':tagsArr
    })
}
module.exports = arr