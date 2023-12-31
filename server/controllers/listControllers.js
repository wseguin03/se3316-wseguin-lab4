const List = require('../models/lists');
const asyncHandler = require('express-async-handler');


const getList = asyncHandler(
    async(req,res) => {
        const new_list = await List.find({user: req.user.username})
        res.json(new_list)
    }
)
const createList = asyncHandler(
    async (req, res) => {
        const { name, description, list, public } = req.body;

        const userListsCount = await List.countDocuments({ user: req.user.username });

        if (userListsCount >= 20) {
            res.status(400);
            throw new Error('You have reached the maximum limit of 20 lists');
        } else {
            const new_list = new List({
                name,
                description,
                list,
                user: req.user.username,
                public
            });

            const createdList = await new_list.save();
            res.status(201).json(createdList);
        }
    }
);
const getListById = asyncHandler(
    async(req,res) => {
        const list = await List.findById(req.params.id)
        if(list){
            res.json(list)
        }else{
            res.status(404)
            throw new Error('List not found')
        }
    }
    
)
const updateList = asyncHandler(
    async(req,res) => {
        const {name,description,list, public} = req.body;
        const list_id = req.params.id;
        // console.log(list_id)
        const list_to_update = await List.findById(list_id)
        if (list_to_update) {
            if(list_to_update.user.toString() !== req.user.toString()){
                list_to_update.name = name
                list_to_update.description = description
                list_to_update.list = list
                list_to_update.public = public

                const updatedList = await list_to_update.save()
                res.json(updatedList)
            }
        } else {
            res.status(404)
            throw new Error('List not found')
        }
    }
)

const deleteList = asyncHandler(
    async(req,res) => {
        const list = await List.findById(req.params.id)
        if (list) {
            if(list.user.toString() !== req.user.toString()){
                await List.deleteOne({ _id: req.params.id })
                res.json({message: 'List removed'})
            } else {
                res.status(404)
                throw new Error('List not found')
            }
        } else {
            res.status(404)
            throw new Error('List not found')
        }
    }
)
module.exports = {getList, createList, getListById, updateList, deleteList};