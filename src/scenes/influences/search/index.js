//GH36 User should be able to search for other users. Tapping on a user avatar or name loads the user profile
//Each search result should include easy ability to request to follow user

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Content, Container, Item, Input, Title, Text, Button, List, Icon, ListItem, Left, Body, Right, Thumbnail, Header, Tabs, Tab } from 'native-base';
import styles from './styles';
import {
    TouchableOpacity,
    View
} from 'react-native';
import { searchForUsersFollowableByCurrentUser, putFollowings, getFriendsSuggestions } from 'PLActions';
import SuggestedFbFriends from '../../../components/SuggestedFbFriends';

class SearchFollowing extends Component {
    static propTypes = {
        token: React.PropTypes.string
    };


    constructor(props) {
        super(props);

        this.state = {
            queryText: "",
            users: [],
            page: 1,
            max_count: 50,
            facebookFriends: [],
        };

        this.onChangeText = this.onChangeText.bind(this);
    }

    componentDidMount() {
        getFriendsSuggestions(this.props.token)
        .then(facebookFriends => {
            this.setState({ facebookFriends });
        }).catch((err) => {
        })
    }

    onChangeText(text) {
        var { token } = this.props;
        var { page, max_count } = this.state;
        this.setState({
            queryText: text
        });
        //Results will only show users who are not already being followed
        searchForUsersFollowableByCurrentUser(token, text, page, max_count)
            .then(data => {
                this.setState({
                    users: data
                })
            })
            .catch(err => {

            });
    }

    follow(index) {
        var { token } = this.props;
        putFollowings(token, this.state.users[index].id)
            .then(() => {
                this.state.users.splice(index, 1);
                this.setState({
                    page: 1,
                    max_count: 50
                });
            })
            .catch(err => {

            });
    }

    followFacebook(id, index) {
        var { token } = this.props;
        putFollowings(token, id)
            .then(() => {
                this.state.facebookFriends.splice(index, 1);
                this.setState({
                    page: 1,
                    max_count: 50
                });
            })
            .catch(err => {

            });
    }

    goToProfile(id) {
        Actions.profile({ id: id });
    }

    render() {
        let users = this.state.users || [];
        return (
            <Container style={styles.container}>
                <Header style={styles.header}>
                    <Left>
                        <Button style={{width: '100%'}}  transparent onPress={() => Actions.pop()} style={{ width: 50, height: 50 }}  >
                            <Icon active name="arrow-back" style={{ color: 'white' }} />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={{ color: 'white', flex: 4 }}>My Influences</Title>
                    </Body>
                    <Right />
                </Header>
                <Item style={styles.searchBar}>
                    <Input style={styles.searchInput} placeholder="Search for influences" value={this.state.queryText} onChangeText={(text) => this.onChangeText(text)} />
                    <Icon active name="search" style={styles.searchIcon} />
                </Item>
                <Content>
                    <List>
                        {
                            (users.length > 0 ? users : []).map((user, index) => {
                                return (
                                    <ListItem avatar onPress={() => this.goToProfile(user.id)} key={index}>
                                        <Left>
                                            <Thumbnail source={{ uri: user.avatar_file_name + '&w=150&h=150&auto=compress,format,q=95' }} />
                                        </Left>
                                        <Body>
                                            <Text>{user.username}</Text>
                                            <Text note>{user.first_name} {user.last_name}</Text>
                                        </Body>
                                        <Right style={styles.itemRightContainer}>
                                            <TouchableOpacity onPress={() => this.follow(index)}>
                                                <View style={styles.buttonContainer}>
                                                    <Icon name="ios-person" style={styles.activeIconLarge} />
                                                    <Icon name="add-circle" style={styles.activeIconSmall} />
                                                </View>
                                            </TouchableOpacity>
                                        </Right>
                                    </ListItem>
                                );
                            })
                        }
                        <SuggestedFbFriends
                            friends={this.state.facebookFriends}
                            onPress={(id) => this.goToProfile(id)}
                            onAddPress={(id, index) => this.followFacebook(id, index)}
                        />
                    </List>
                </Content>
            </Container>
        );
    }
}


const mapStateToProps = state => ({
    token: state.user.token
});

export default connect(mapStateToProps)(SearchFollowing);