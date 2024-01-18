import { useEffect, useState } from "react";
import { useInterval } from "./Utils";
import Common from "./Common";

import { CellType, SnakeDirection } from './Constants';

const BOARD_X_SIZE = 30;
const BOARD_Y_SIZE = 30;
const DEFAULT_SNAKE_LENGTH = 5;
const FOOD_COUNT = 5;

export default function Board() {

    const [ boardCoordinate, setBoardCoordinate ] =  useState([]);
    const [ snakeCoordinate, setSnakeCoordinate ] =  useState([]);
    const [ foodCoordinate, setFoodCoordinate ] =  useState([]);
    const [ snakeDirection, setSnakeDirection ] = useState(SnakeDirection.RIGHT);
    const [ gameStart, setGameStart ] = useState(false);
    const [ score, setScore ] = useState(0);
    const [ speed, setSpeed ] = useState(200);
    const [ isNewInterval, setIsNewInterval ] = useState(true);
    const [ cellSize, setCellSize ] = useState(0);

    useEffect(() => {
        const onResize = () => {
            let axis = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
            setCellSize(Math.floor(axis / 32));
        }

        let board_coordinate = [];

        for(let x = 0; x < BOARD_X_SIZE; x++) {
            board_coordinate[x] = [];
            for(let y = 0; y < BOARD_Y_SIZE; y++) {
                board_coordinate[x][y] = CellType.empty;
            }
        }
        
        generateSnake(board_coordinate);
        setBoardCoordinate(board_coordinate);
        onResize();

        window.addEventListener('resize', onResize);

        return function cleanup() {
            document.removeEventListener('resize', onResize);
        }

    }, []);

    useEffect(() => {
        const keypress = (key) => {
            if(key.keyCode === 32) { //Space
                startGame();
            } else if(gameStart && isNewInterval && key.keyCode >= 37 && key.keyCode <= 40) {
                setIsNewInterval(false);
                if(key.keyCode === 37) { //Left
                    if(snakeDirection !== SnakeDirection.RIGHT) {
                        setSnakeDirection(SnakeDirection.LEFT);
                    }
                } else if(key.keyCode === 38) { //Up
                    if(snakeDirection !== SnakeDirection.DOWN) {
                        setSnakeDirection(SnakeDirection.UP);
                    }
                } else if (key.keyCode === 39) { //Right
                    if(snakeDirection !== SnakeDirection.LEFT) {
                        setSnakeDirection(SnakeDirection.RIGHT);
                    }
                } else if (key.keyCode === 40) { //Down
                    if(snakeDirection !== SnakeDirection.UP) {
                        setSnakeDirection(SnakeDirection.DOWN);
                    }
                }
            }
        }

        document.addEventListener('keydown', keypress);

        return function cleanup() {
            document.removeEventListener('keydown', keypress);
        }
    }, [gameStart, snakeDirection, isNewInterval]);

    useEffect(() => {
        if(foodCoordinate.length < FOOD_COUNT) {
            generateFood();
        }
    }, [foodCoordinate]);

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
        
        setFoodCoordinate([...foodCoordinate, [foodX, foodY]]);
    }

    const getRandomCell = (size) => {
        return Math.floor(Math.random() * size);
    }

    const moveSnake = () => {
        let newCoordinate = Common().deepCopy(snakeCoordinate);
        let newHeadCoordinate = Common().deepCopy(newCoordinate[0]);
        
        if(snakeDirection === SnakeDirection.LEFT) {
            newHeadCoordinate[1] -= 1;
        } else if(snakeDirection === SnakeDirection.UP) {
            newHeadCoordinate[0] -= 1;
        } else if(snakeDirection === SnakeDirection.RIGHT) {
            newHeadCoordinate[1] += 1;
        } else if(snakeDirection === SnakeDirection.DOWN) {
            newHeadCoordinate[0] += 1;
        }

        if(isOutOfBoard(newHeadCoordinate) || selfEaten(newHeadCoordinate)) {
            stopGame();
        } else {
            //If eat food
            if(foodCoordinate.find(food => JSON.stringify(food) === JSON.stringify(newHeadCoordinate))) {
                setScore(score => score + 1);
                setFoodCoordinate(foodCoordinate.filter(food => JSON.stringify(food) !== JSON.stringify(newHeadCoordinate)));

                if((score + 1) % 10 === 0) {
                    setSpeed(speed => Math.floor(speed * 0.8));
                }
            } else {
                newCoordinate.splice(newCoordinate.length-1, 1);
            }
            newCoordinate.splice(0, 0, newHeadCoordinate);
            setSnakeCoordinate(newCoordinate);
        }
    }

    useInterval(() => {
        if(gameStart) {
            moveSnake();
            setIsNewInterval(true);
        }
    }, speed);

    const startGame = () => {
        setGameStart(true);
    }

    const stopGame = () => {
        setGameStart(false);
    }

    const isOutOfBoard = (newHeadCoordinate) => {
        return (newHeadCoordinate[0] < 0
        || newHeadCoordinate[1] < 0
        || newHeadCoordinate[0] >= BOARD_X_SIZE
        ||newHeadCoordinate[1] >= BOARD_Y_SIZE);
    }

    const selfEaten = (newHeadCoordinate) => {
        ///
        let newCoordinate = snakeCoordinate.find(snake => JSON.stringify(snake) === JSON.stringify(newHeadCoordinate));
        if(newCoordinate !== undefined) {
            console.log(newCoordinate);
            console.log(snakeDirection);
            console.log(snakeCoordinate);
        }
        ///

        return snakeCoordinate.find(snake => JSON.stringify(snake) === JSON.stringify(newHeadCoordinate)) !== undefined;
    }

    const getCellColor = (x, y) => {
        let cellType = CellType.empty;
        
        //For food
        if(foodCoordinate.find(food => JSON.stringify(food) === JSON.stringify([x, y]))) {
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

    return (
        <div style={{ width: 'fit-content', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                <div>Score: {score}</div>
                {gameStart ? '' : (score === 0 ? 'Press space to start' : 'Game Over')}
                <div>Current Speed: {speed}</div>
            </div>
            {
                boardCoordinate.map((row, x) => (
                    <div style={{ display: 'flex', width: 'fit-content' }}>
                        {
                            row.map((col, y) => (
                                <div style={{ backgroundColor: getCellColor(x, y), height: cellSize + 'px', width: cellSize + 'px' }} />
                            ))
                        }
                    </div>
                ))
            }
        </div>
    );
}