import React from 'react';
import styles from './Sneak.css';

class Sneak extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
                'c_x_pos': 3,
                'c_y_pos': 3
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
            }
        }
    }

    componentDidMount() {
        setInterval(() => {
            this.move();
        }, 100);
        window.addEventListener('keydown', (e) => {
            this.changeDirection(e.code)
        });
        setTimeout(() => {
            this.placePoint();
        }, 1500);
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
    };

    endGame = () => {
        window.location.reload();
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
                </div>
                <button onClick={this.addSnakeModule}>Add Module</button>
            </React.Fragment>
        )
    }
}

export default Sneak;