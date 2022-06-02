/**
* Will catch async error without having a try catch block on async functions
* async will return a promise and that enables us to have a catch
*/
module.exports = fn => {
 return (req, res, next) => {
   fn(req, res, next).catch(next)
 }
}
