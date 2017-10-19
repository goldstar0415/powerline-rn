import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { View, TouchableOpacity, Linking } from 'react-native';
import ParsedText from 'react-native-parsed-text';
import { Text, Left, Body, CardItem, Label, Icon } from 'native-base';
import styles from '../styles';

class FeedDescription extends Component {
  goItemDetail(entityId, entityType) {
    Actions.itemDetail({ entityId: entityId, entityType: entityType });
  }
  _renderTitle(item) {
    if (item.title) {
      return (<Text style={styles.title}>{item.title}</Text>);
    } else {
      return null;
    }
  }
  // The priority zone counter lists the count of total priority zone items in the newsfeed
  _renderZoneIcon(item) {
    if (item.zone === 'prioritized') {
      return (<Icon active name='ios-flash' style={styles.zoneIcon} />);
    } else {
      return null;
    }
  }

  handleUrlPress = url => {
    // alert(url)
    Linking.openURL(url);
  }

  handleUserPress = user => {
    // TODO: remove @everyone from click
    // Actions.profile({ id: id });
    // console.log('IAMasdfasfd', this.props.item)
    alert(user)
  }

  handleHashtagPress = hashtag => {
    Actions.search({ search: hashtag.substring(1), initialPage: 2 });
  }

  render() {
    let { item } = this.props;

    return (
      <CardItem style={{ paddingLeft: 15, paddingRight: 15 }}>
        <Left>
          <View style={styles.descLeftContainer}>
            {this._renderZoneIcon(item)}
            <Label style={styles.commentCount}>{item.responses_count}</Label>
          </View>
          <Body style={styles.descBodyContainer}>
            <TouchableOpacity onPress={() => this.goItemDetail(item.entity.id, item.entity.type)}>
              {this._renderTitle(item)}
              <ParsedText
                style={styles.description}
                parse={
                  [
                    { type: 'url', style: styles.url, onPress: this.handleUrlPress },
                    { pattern: /@(\w+)/, style: styles.username, onPress: this.handleUserPress },
                    { pattern: /#(\w+)/, style: styles.hashtag, onPress: this.handleHashtagPress },
                  ]
                }
                numberOfLines={5}
                childrenProps={{ allowFontScaling: false }}
              >
                {item.description}
              </ParsedText>
            </TouchableOpacity>
          </Body>
        </Left>
      </CardItem>
    );
  }
}
export default FeedDescription;
