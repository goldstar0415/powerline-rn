import React, {Component} from 'react';
import { Actions } from 'react-native-router-flux';
import { View, TouchableOpacity } from 'react-native';

import { Text, Left, Body, CardItem, Label, Icon } from 'native-base';
import styles from '../styles';

class FeedDescription extends Component {
    goItemDetail (entityId, entityType) {
        let type;
        console.log('entityType: ', entityType);
        switch (entityType) {
        case 'user-petition':
            type = 'petition';
            break;
        case 'petition':
            type = 'poll';
            break;
        case 'question':
            type = 'poll';
            break;
        case 'post':
            type = 'post';
            break;
        case 'leader-petition':
            type = 'poll';
        }
        console.log('type: ', type);
        Actions.itemDetail({ entityId: entityId, entityType: type });
    }
    _renderTitle (item) {
        if (item.title) {
            return (<Text style={styles.title}>{item.title}</Text>);
        } else {
            return null;
        }
    }
    // The priority zone counter lists the count of total priority zone items in the newsfeed
    _renderZoneIcon (item) {
        if (item.zone === 'prioritized') {
            return (<Icon active name='ios-flash' style={styles.zoneIcon} />);
        } else {
            return null;
        }
    }

    render () {
        let {item} = this.props;

        return (
            <CardItem style={{paddingLeft: 15, paddingRight: 15}}>
                <Left>
                    <View style={styles.descLeftContainer}>
                        {this._renderZoneIcon(item)}
                        <Label style={styles.commentCount}>{item.responses_count}</Label>
                    </View>
                    <Body style={styles.descBodyContainer}>
                        <TouchableOpacity onPress={() => this.goItemDetail(item.entity.id, item.entity.type)}>
                            {this._renderTitle(item)}
                            <Text style={styles.description} numberOfLines={5}>{item.description}</Text>
                        </TouchableOpacity>
                    </Body>
                </Left>
            </CardItem>
        );
    }
}
export default FeedDescription;
