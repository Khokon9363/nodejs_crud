// Dependencies
const fs = require('fs')
const path = require('path')

const lib = {}

// base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/')

// write data to file
lib.create = (dir, file, data, callback) => {
    // open file for write
    fs.open(`${lib.basedir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            // Convert data to string
            const stringData = JSON.stringify(data)

            // write data to the file & then close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if(!err){
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            callback(false)
                        }else{
                            callback("Could not closing the new file!")
                        }
                    })
                }else{
                    callback('Could not write into new file!')
                }
            })
        }else{
            callback('Could not create new file, it may already exists!')
        }
    })
}

// read data from a file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir}${dir}/${file}.json`, 'utf-8', (err, data) => {
        callback(err, data)
    })
}

// update existing file
lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.basedir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            // Convert the data to string
            const stringData = JSON.stringify(data)

            // truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
                if(!err){
                    // write to the file & close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if(!err){
                            fs.close(fileDescriptor, (err) => {
                                if(!err){
                                    callback(false)
                                }else{
                                    callback("Could not closing file!")
                                }
                            })
                        }else{
                            callback("Could not write on the file!")
                        }
                    })
                }else{
                    callback("Could not truncate file!")
                }
            })
        }else{
            callback('Could not update, file may not exist!');
        }
    })
}

// delete file
lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${lib.basedir}${dir}/${file}.json`, (err) => {
        if(!err){
            callback("File deleted successfully")
        }else{
            callback("Could not delete file")
        }
    })
}

module.exports = lib