import { useEffect, useState } from "react";
import { useInterval } from "./Utils";
import Common from "./Common";

import { CellType, SnakeDirection } from './Constants';

const BOARD_X_SIZE = 20;
const BOARD_Y_SIZE = 20;
const DEFAULT_SNAKE_LENGTH = 5;

export default function Board() {

    const [ boardCoordinate, setBoardCoordinate ] =  useState([]);
    const [ snakeCoordinate, setSnakeCoordinate ] =  useState([]);
    const [ foodCoordinate, setFoodCoordinate ] =  useState([]);
    const [ snakeDirection, setSnakeDirection ] = useState(SnakeDirection.RIGHT);
    const [ gameStart, setGameStart ] = useState(false);

    useEffect(() => {
        let board_coordinate = [];

        for(let x = 0; x < BOARD_X_SIZE; x++) {
            board_coordinate[x] = [];
            for(let y = 0; y < BOARD_Y_SIZE; y++) {
                board_coordinate[x][y] = CellType.empty;
            }
        }

        generateSnake(board_coordinate);
        generateFood(board_coordinate);
        setBoardCoordinate(board_coordinate);

        document.addEventListener('keydown', keypress);

        // Don't forget to clean up
        return function cleanup() {
            document.removeEventListener('keydown', keypress);
        }
    }, []);

    const generateSnake = () => {
        let snakeHeadX = BOARD_X_SIZE/2;
        let snakeHeadY = BOARD_Y_SIZE/2;

        let snakeBody = [];
        snakeBody.push([snakeHeadX, snakeHeadY]);

        for(let i = 1; i <= DEFAULT_SNAKE_LENGTH; i++) {
            snakeBody.push([snakeHeadX, snakeHeadY-i]);
        }

        setSnakeCoordinate(snakeBody);
    }

    const generateFood = () => {
        let foodX = 0;
        let foodY = 0;

        do {
            foodX = getRandomCell(BOARD_X_SIZE);
            foodY = getRandomCell(BOARD_Y_SIZE);
        } while(snakeCoordinate.find(snake => JSON.stringify(snake) === JSON.stringify([foodX, foodY])));
        
        setFoodCoordinate([foodX, foodY]);
    }

    const getRandomCell = (size) => {
        return Math.floor(Math.random() * size);
    }

    const moveSnake = () => {
        let newCoordinate = Common().deepCopy(snakeCoordinate);
        let newHeadCoordinate = Common().deepCopy(newCoordinate[0]);
        newCoordinate.splice(newCoordinate.length-1, 1);

        if(snakeDirection === SnakeDirection.LEFT) {
            newHeadCoordinate[1] -= 1;
        } else if(snakeDirection === SnakeDirection.UP) {
            newHeadCoordinate[0] -= 1;
        } else if(snakeDirection === SnakeDirection.RIGHT) {
            newHeadCoordinate[1] += 1;
        } else if(snakeDirection === SnakeDirection.DOWN) {
            newHeadCoordinate[0] += 1;
        }

        newCoordinate.splice(0, 0, newHeadCoordinate);
        setSnakeCoordinate(newCoordinate);
    }

    useInterval(() => {
        if(gameStart) {
            moveSnake();
        }
    }, 1000)

    const startGame = () => {
        setGameStart(true);
    }

    const getCellColor = (x, y) => {
        let cellType = CellType.empty;
        
        //For food
        if(JSON.stringify([x, y]) === JSON.stringify(foodCoordinate)) {
            cellType = CellType.food;
        }

        //For snake
        if(snakeCoordinate.find(snake => JSON.stringify(snake) === JSON.stringify([x, y]))) {
            if(JSON.stringify(snakeCoordinate[0]) === JSON.stringify([x, y])) {
                cellType = CellType.snakeHead;
            } else {
                cellType = CellType.snakeBody;
            }
        }

        switch(cellType) {
            case CellType.snakeHead: return '#084FB4';
            case CellType.snakeBody: return '#6798FF';
            case CellType.food: return '#C72C31';
            case CellType.empty: return '#282C34';
            default: return '#FFFFFF';
        }
    }

    const keypress = (key) => {
        if(key.keyCode === 37) { //Left
            console.log("LEFT!");
            setSnakeDirection(SnakeDirection.LEFT);
        } else if(key.keyCode === 38) { //Up
            console.log("UP!");
            setSnakeDirection(SnakeDirection.UP);
        } else if (key.keyCode === 39) { //Right
            console.log("RIGHT!");
            setSnakeDirection(SnakeDirection.RIGHT);
        } else if (key.keyCode === 40) { //Down
            console.log("DOWN!");
            setSnakeDirection(SnakeDirection.DOWN);
        }
    }

    return (
        <>
            {
                boardCoordinate.map((row, x) => (
                    <div style={{ display: 'flex' }}>
                        {
                            row.map((col, y) => (
                                <div style={{ backgroundColor: getCellColor(x, y), height: '30px', width: '30px' }} />
                            ))
                        }
                    </div>
                ))
            }
            <button onClick={startGame}>Start</button>
        </>
    );
}