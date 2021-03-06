
import api from '../utils/api';
var { API_URL, PER_PAGE } = require('../PLEnv');
var { Action, ThunkAction } = require('./types');

//Newsfeed activities can be loaded by All, by Group (town/state/country/group), by Friends, by Specific user, or by Favorites
async function loadActivities(token: string, page: ?number = 0, perPage: ?number = PER_PAGE, group: ?string = 'all', user: ?string = 'all', followed = 'all'): Promise<Action> {
    console.log(`${API_URL}/v2/activities?_format=json&user=${user}&group=${group}&page=${page + 1}&per_page=${perPage}&followed=${followed}`);
    // '/api/v2/activities?user=all&group=all&page=1&per_page=20&followed=true'
    // '/api/v2/activities?user=all&group=all&followed=true&page=0&per_page=20'
    try {
        var response = await fetch(`${API_URL}/v2/activities?_format=json&user=${user}&group=${group}&followed=${followed}&page=${page + 1}&per_page=${perPage}`, {
            method: 'GET',
            headers: {
                'token': token,
                'Content-Type': 'application/json',
            }
        });
        var json = await response.json();
        
        const statistics = await api.get(token, '/v2/user/statistics');
        const { priority_item_count } = await statistics.json();

        if (json.totalItems) {
            const action = {
                type: 'LOADED_ACTIVITIES',
                data: {
                    page: json.page,
                    totalItems: json.totalItems,
                    items: json.items,
                    payload: json.payload,
                    newsfeedUnreadCount: priority_item_count,
                },
            };
            return Promise.resolve(action);
        }
        else {
            return Promise.reject(json);
        }
    } catch (error) {
        // TEST PURPOSE:
        console.error(error);
        return Promise.reject(error);
    }
}
async function loadFriendsActivities(token: string, page: ?number = 0, perPage: ?number = PER_PAGE): Promise<Action> {
    try {
        var response = await fetch(`${API_URL}/v2/activities?_format=json&followed=true&page=${page + 1}&per_page=${perPage}`, {
            method: 'GET',
            headers: {
                'token': token,
                'Content-Type': 'application/json',
            }
        });
        var json = await response.json();
        if (json.totalItems) {
            // console.log('${API_URL}/v2/activities?_format=json&followed=true&page=${page + 1}&per_page=${perPage} --- load friends activities return: ', json.payload.map(item => item.title + item.description))
            const action = {
                type: 'LOADED_ACTIVITIES',
                data: {
                    page: json.page,
                    totalItems: json.totalItems,
                    items: json.items,
                    payload: json.payload,
                },
            };
            return Promise.resolve(action);
        }
        else {
            return Promise.reject(json);
        }
    } catch (error) {
        // TEST PURPOSE:
        console.error(error);
        return Promise.reject(error);
    }
}



function resetActivities(): ThunkAction {
    return (dispatch) => {
        return dispatch({
            type: 'RESET_ACTIVITIES',
        });
    };
}

function loadActivitiesByUserId(token, page = 0, per_page = 20, group = 'all', user) {
    // console.log(token, page, per_page, group, user)
    return new Promise((resolve, reject) => {
        fetch(API_URL + '/v2/activities?_format=json&user=' + user + '&group=' + group + '&page=' + page + '&per_page=' + per_page, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        })
            .then((res) => res.json())
            .then(data => {
                console.log("Load Activities by User Id API success", data);
                resolve(data);
            })
            .catch(err => {
                console.log("Load Activities by User Id API error", err);
                reject(err);
            })
    });
}

//Should be for loading public groups (Town/state/country) or by public groups (e.g. Save the Whales)
function loadActivityByEntityId(token, entityType, entityId) {
    console.log('about to fetch => ' + '/v2/activities?_format=json&' + entityType + '_id=' + entityId + '&page=1&per_page=20');
    // /api/v2/activities?petition_id=349&page=1&per_page=20
    return new Promise((resolve, reject) => {
        fetch(API_URL + '/v2/activities?_format=json&' + entityType + '_id=' + entityId + '&page=1&per_page=20', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        })
            .then((res) => {console.log('res', res); return res.json()})
            .then(data => {
                console.log("Load Activity by Entity Id API success", data);
                resolve(data);
            })
            .catch(err => {
                console.log("Load Activity by Entity Id API error", err);
                reject(err);
            })
    });
}

//This relates to the Notifications tab
function putSocialActivity(token, id, ignore){
    return new Promise((resolve, reject) => {
        fetch(API_URL + '/v2/social-activities/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({
                ignore: ignore
            })
        })
        .then((res) => res.json())
        .then(data => {
            console.log("Put Social Activity API Success", data);
            resolve(data);
        })
        .catch(err => {
            console.log("Put Social Activity API Error", err);
            reject(err);
        });
    });
}

module.exports = {
    loadActivities,
    resetActivities,
    loadActivitiesByUserId,
    loadActivityByEntityId,
    putSocialActivity,
    loadFriendsActivities
}