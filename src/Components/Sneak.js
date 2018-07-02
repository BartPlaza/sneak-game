import React from 'react';
import styles from './Sneak.css';
import axios from 'axios';
import Pusher from 'pusher-js';

class Sneak extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socketId: null,
            player_1: null,
            player_2: null,
            game_status: 'stopped',
            allowKeys: [{'code': 'ArrowRight', 'alias': 'r', 'direction': 'h'},
                {'code': 'ArrowLeft', 'alias': 'l', 'direction': 'h'},
                {'code': 'ArrowUp', 'alias': 'u', 'direction': 'v'},
                {'code': 'ArrowDown', 'alias': 'd', 'direction': 'v'}],
            gameArea: {
                'x_start': 1,
                'x_end': 20,
                'y_start': 1,
                'y_end': 20
            },
            point: {
                'c_x_pos': 10,
                'c_y_pos': 10
            },
            direction: 'r',
            sneak_1: {
                modules: 1,
                p_1: {
                    c_x_pos: 4,
                    c_y_pos: 4,
                    prev_c_x_pos: 4,
                    prev_c_y_pos: 3
                },
            },
            sneak_2: null,
            interval: null
        }
    }

    componentDidMount() {

        window.addEventListener('keydown', (e) => {
            this.changeDirection(e.code)
        });

        const pusher = new Pusher('bfd38bdadf2ce4d78439', {
            cluster: 'eu',
            encrypted: true
        });

        pusher.connection.bind('connected', () => {
            this.setState({
                'socketId': pusher.connection.socket_id
            })
        });

        const channel = pusher.subscribe('sneak-move');

        channel.bind('move', (data) => {
            if (data.socketId !== this.state.socketId) {
                this.setState({
                    'sneak_2': data.sneak
                });
            }
        });

        channel.bind('point', (data) => {
            console.log(data);
            this.setState({
                'point': data
            });
        });

        channel.bind('player_1', (data) => {
            console.log(data);
            this.setState({
                'player_1': data.player
            });
        });

        channel.bind('player_2', (data) => {
            console.log(data);
            this.setState({
                'player_2': data.player
            });
        });

        channel.bind('game_status_changed', (data) => {
            console.log(data);
            this.setState({
                'game_status': data.status
            });
        });

    };

    componentDidUpdate(){
        let status = this.state.game_status;
        if(status === 'started' && this.state.interval === null){
            const interval = setInterval(() => {
                this.move();
            }, 200);
            this.setState({
                'interval': interval
            });
        }

        if(status === 'stopped' && this.state.interval !== null){
            this.stopGame();
        }
    };

    move = () => {
        if (this.checkIsInArea() && !this.checkIsInCollision()) {
            this.makeMove(this.state.direction);
            this.checkHasPoint();
        } else {
            this.endGame();
        }
    };

    makeMove = (direction) => {
        console.log(direction);
        Object.keys(this.state.sneak_1).forEach((module, index) => {
            if (module !== 'modules') {
                let sneak = {...this.state.sneak_1};
                sneak[module].prev_c_x_pos = sneak[module].c_x_pos;
                sneak[module].prev_c_y_pos = sneak[module].c_y_pos;
                this.setState({
                    'sneak_1': sneak
                })
            }
            if (module !== 'modules' && module !== 'p_1') {
                let sneak = {...this.state.sneak_1};
                let prevModName = 'p_' + (index - 1);
                let prevMod = sneak[prevModName];

                sneak[module].c_x_pos = prevMod.prev_c_x_pos;
                sneak[module].c_y_pos = prevMod.prev_c_y_pos;

                this.setState({
                    'sneak_1': sneak
                })
            }
            axios.post('http://localhost:5000/action', {'sneak': this.state.sneak_1, 'socketId': this.state.socketId});
        });
        let sneak = {...this.state.sneak_1};
        switch (direction) {
            case 'r': {
                sneak.p_1.c_y_pos++;
                break;
            }
            case 'l': {
                sneak.p_1.c_y_pos--;
                break;
            }
            case 'u': {
                sneak.p_1.c_x_pos--;
                break;
            }
            case 'd': {
                sneak.p_1.c_x_pos++;
                break;
            }
        }
        this.setState({sneak_1: sneak});
    };

    changeDirection = (keyCode) => {
        this.state.allowKeys.forEach((key) => {
            if ((key.code === keyCode) && (key.direction !== this.currentDirection())) {
                console.log(key.alias);
                this.setState({
                    'direction': key.alias
                });
            }
        })
    };

    currentDirection = () => {
        let dir = this.state.allowKeys.filter((key) => {
            return key.alias === this.state.direction;
        });
        return dir[0].direction;
    };

    checkHasPoint = () => {
        if ((this.state.sneak_1.p_1.c_x_pos === this.state.point.c_x_pos) && (this.state.sneak_1.p_1.c_y_pos === this.state.point.c_y_pos)) {
            this.addSnakeModule();
            this.placePoint();
        }
    };

    checkIsInArea = () => {
        let sneak_x = this.state.sneak_1.p_1.c_x_pos;
        let sneak_y = this.state.sneak_1.p_1.c_y_pos;

        if ((sneak_x > this.state.gameArea.x_end) ||
            (sneak_x < this.state.gameArea.x_start) ||
            (sneak_y > this.state.gameArea.y_end) ||
            (sneak_y < this.state.gameArea.y_start)) {
            return false;
        }
        return true;
    };

    checkIsInCollision = () => {
        let result = false;
        let sneak = this.state.sneak_1;
        Object.keys(sneak)
            .filter((key) => key !== 'modules' && key !== 'p_1')
            .forEach((module) => {
                if ((sneak.p_1.c_x_pos === sneak[module].c_x_pos) &&
                    (sneak.p_1.c_y_pos === sneak[module].c_y_pos)) {
                    result = true;
                }
            });
        return result;
    };

    addSnakeModule = () => {
        let sneak = {...this.state.sneak_1};
        sneak.modules++;
        let currentModuleKey = 'p_' + sneak.modules;
        let prevModuleKey = 'p_' + (sneak.modules - 1);
        sneak[currentModuleKey] = {};
        sneak[currentModuleKey].c_x_pos = sneak[prevModuleKey].prev_c_x_pos;
        sneak[currentModuleKey].c_y_pos = sneak[prevModuleKey].prev_c_y_pos;
        this.setState({'sneak_1': sneak});
    };

    placePoint = () => {
        let newPoint = {...this.state.point};
        newPoint.c_x_pos = Math.floor((Math.random() * 20) + 1);
        newPoint.c_y_pos = Math.floor((Math.random() * 20) + 1);
        this.setState({
            'point': newPoint
        });
        axios.post('http://localhost:5000/point', newPoint);
    };

    endGame = () => {
        axios.post('http://localhost:5000/game_status_changed', {'status': 'stopped'});
        this.stopGame();
    };

    startGame = () => {
        this.setPlayer();
        if (this.state.player_1 && this.state.player_2) {

        }
    };

    setPlayer = () => {
        if (this.state.player_1 === null) {
            this.setState({
                'player_1': 'player_1'
            });
            axios.post('http://localhost:5000/player_1', {'player': 'player_1'});
        } else if (this.state.player_2 === null) {
            this.setState({
                'player_2': 'player_2'
            });
            axios.post('http://localhost:5000/player_2', {'player': 'player_2'})
                .then(() => {
                    this.setState({
                        game_status: 'started'
                    });
                    axios.post('http://localhost:5000/game_status_changed', {'status': 'started'})
                });
        }
    };

    stopGame = () => {
        clearInterval(this.state.interval);
        this.setState({
            'interval': null
        });
        setTimeout(()=>{
            window.location.reload();
        },2000);
    };

    render() {
        return (
            <React.Fragment>
                <div id="container">
                    <div className="point" style={{
                        'gridRowStart': this.state.point.c_x_pos,
                        'gridRowEnd': this.state.point.c_x_pos + 1,
                        'gridColumnStart': this.state.point.c_y_pos,
                        'gridColumnEnd': this.state.point.c_y_pos + 1
                    }}>
                    </div>
                    {Object.keys(this.state.sneak_1)
                        .filter((key) => key !== 'modules')
                        .map((module, index) => {
                            let moduleName = this.state.sneak_1[module];
                            return (
                                <div className="sneak-1" id={module} style={
                                    {
                                        'gridRowStart': moduleName.c_x_pos,
                                        'gridRowEnd': moduleName.c_x_pos + 1,
                                        'gridColumnStart': moduleName.c_y_pos,
                                        'gridColumnEnd': moduleName.c_y_pos + 1
                                    }
                                }/>
                            )
                        })}
                    {this.state.sneak_2 ? (
                        Object.keys(this.state.sneak_2)
                            .filter((key) => key !== 'modules')
                            .map((module, index) => {
                                let moduleName = this.state.sneak_2[module];
                                return (
                                    <div className="sneak-2" id={module} style={
                                        {
                                            'gridRowStart': moduleName.c_x_pos,
                                            'gridRowEnd': moduleName.c_x_pos + 1,
                                            'gridColumnStart': moduleName.c_y_pos,
                                            'gridColumnEnd': moduleName.c_y_pos + 1
                                        }
                                    }/>
                                )
                            })
                    ) : null}
                </div>
                <button onClick={this.startGame}>Start game</button>
                <button onClick={this.addSnakeModule}>Add Module</button>
                <button onClick={this.stopGame}>Stop game</button>
            </React.Fragment>
        )
    }
}

export default Sneak;