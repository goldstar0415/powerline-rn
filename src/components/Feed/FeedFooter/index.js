import React, {Component} from 'react';
import {Actions} from 'react-native-router-flux';
import { Button, Icon, Left, CardItem, Label } from 'native-base';
import styles from '../styles';
import { votePost, loadActivityByEntityId, signUserPetition, signLeaderPetition, undoVotePost } from 'PLActions';
import _ from 'lodash';

class FeedFooter extends Component {
    constructor (props) {
        super(props);
        this.state = {
            isLoading: false,
            item: this.props.item
        };
    }

    // changes the upvote/downvote color to indicate selection, sets the upvote/downvote number before the response comes. if the requisition fails, undo all
    async vote (item, option) {
        // uses lodash.cloneDeep to avoid keeping references
        // console.log(item);
        let originalItem = _.cloneDeep(this.state.item);
        let newItem = _.cloneDeep(this.state.item);

        const { profile, token } = this.props;

        // user shouldn't vote his own post
        if (profile.id === item.user.id) {
            alert("You're not supposed to vote on your own Post.");
            return;
        }
        if (this.state.postingVote) {
            return;
        }
        // uses this state to avoid double clicking, the user is allowed to vote again only when the last request is done
        this.setState({postingVote: true});
        let undo = false;

        if (option === 'upvote') {
            if (!newItem.post.votes[0]) {
            // didnt have any option checked
                newItem.post.votes.push({option: 1});
                newItem.upvotes_count += 1;
            } else {
                // user is unsetting his vote
                if (newItem.post.votes[0].option === 1) {
                    newItem.post.votes[0].option = null;
                    newItem.upvotes_count -= 1;
                    undo = true;
                } else {
                    // user is setting his vote to up, had the down up checked
                    if (item.post.votes[0].option === 2) {
                        newItem.post.votes[0].option = 1;
                        newItem.upvotes_count += 1;
                        newItem.downvotes_count -= 1;
                    }
                }
            }
        } else if (option === 'downvote') {
            if (!newItem.post.votes[0]) {
                // didnt have any option checked
                newItem.post.votes.push({option: 2});
                newItem.downvotes_count += 1;
            }
            // user is unsetting his vote
            if (newItem.post.votes[0].option === 2) {
                newItem.post.votes[0].option = null;
                newItem.downvotes_count -= 1;
                undo = true;
            } else {
                // user is setting his vote to down, had the option up checked
                if (newItem.post.votes[0].option === 1) {
                    newItem.post.votes[0].option = 2;
                    newItem.upvotes_count -= 1;
                    newItem.downvotes_count += 1;
                }
            }
        }

        this.setState({item: newItem});

        // console.log('=x=x=x=x= updated this.item =x=x=x=x=x=', this.item);

        let response;
        if (item.entity.type === 'post') {
            if (undo) {
                // deletes the option
                response = await undoVotePost(this.props.token, item.entity.id);
            } else {
                // sets the option
                response = await votePost(this.props.token, item.entity.id, option);
            }
        }
        // console.log("res ==> ", response);
        if (response.user || response.status == 204) {
            // console.log(token, originalItem.entity);
            loadActivityByEntityId(token, this.state.item.entity.type, this.state.item.entity.id).then(data => {
                // console.log(data);
                if (data.payload && data.payload[0]) {
                    this.setState({item: data.payload[0], postingVote: false});
                }
            }).catch(err => {
                // resets this.state.item
                // console.log('strange err', err);
                this.setState({item: originalItem, postingVote: false});
                alert('Something went wrong to vote');
            });
        } else {
            this.setState({item: originalItem, postingVote: false});
            let message = 'Something went wrong to vote';
            // console.log(response);
            if (response.errors) {
                message = response.message;
            }
            alert(message);
        }
    }

    async sign (item) {
        let {token} = this.props;
        // console.log(item);

        // saving original item to change it back if the sign request fails
        let originalItem = _.cloneDeep(this.state.item);
        let newItem = _.cloneDeep(this.state.item);
        this.setState({signing: true});

        // avoid double tapping until the response comes
        if (this.state.signing) return;

        // console.log(item.entity.type);
        let res;
        if (item.entity.type === 'user-petition') {
            // console.log('user-petition');
            try {
                res = await signUserPetition(token, item.id);
                // console.log(res);
            } catch (error) {
                // console.log('error on request => ', error);
                this.setState({signing: false, item: originalItem});
            }
        } else if (item.entity.type === 'petition') {
            // console.log('leader-petition');
            try {
                res = await signLeaderPetition(token, item.id, item.option === 1 ? 1 : 2);
                // console.log(res);
            } catch (error) {
                // console.log('error on request => ', error);
                this.setState({signing: false, item: originalItem});
            }
        }

        // console.log('xXresXx', res);
    }

    _renderReplyIcon (item, type) {
        // console.log(item);
        console.log('typee, ', type, item.entity.type, '  - ', item.description);
        return (
            <Label style={styles.footerText} onPress={() => Actions.itemDetail({entityId: item.id, entityType: type, commenting: true})}>
                {'Reply '}
                {item.comments_count ? item.comments_count : 0}
            </Label>
        );
    }

    // on this one we need this to control upvote / downvote before a response comes from the API
    _renderPostFooter () {
        let {item} = this.state;
        // console.log(item);
        if (item.zone === 'expired') {
            return (
                <CardItem footer style={{ height: 35 }}>
                    <Left style={{ justifyContent: 'flex-start' }}>
                        <Button iconLeft transparent style={styles.footerButton}>
                            <Icon active name='ios-undo' style={styles.footerIcon} />
                            {this._renderReplyIcon(item, 'post')}
                        </Button>
                    </Left>
                </CardItem>
            );
        } else {
            let isVotedDown = false;
            let isVotedUp = false;
            if (
                item && item.post &&
                item.post.votes && item.post.votes[0]
            ) {
                let vote = item.post.votes[0];
                isVotedUp = false;
                isVotedDown = false;
                if (vote.option === 1) {
                    isVotedUp = true;
                } else if (vote.option === 2) {
                    isVotedDown = true;
                }
            }
            return (
                <CardItem footer style={{ height: 35 }}>
                    <Left style={{ justifyContent: 'space-between' }}>
                        <Button iconLeft transparent style={styles.footerButton} onPress={() => this.vote(item, 'upvote')}>
                            <Icon name='md-arrow-dropup' style={isVotedUp ? styles.footerIconBlue : styles.footerIcon} />
                            <Label style={isVotedUp ? styles.footerTextBlue : styles.footerText}>Upvote {item.upvotes_count ? item.upvotes_count : 0}</Label>
                        </Button>
                        <Button iconLeft transparent style={styles.footerButton} onPress={() => this.vote(item, 'downvote')}>
                            <Icon active name='md-arrow-dropdown' style={isVotedDown ? styles.footerIconBlue : styles.footerIcon} />
                            <Label style={isVotedDown ? styles.footerTextBlue : styles.footerText}>Downvote {item.downvotes_count ? item.downvotes_count : 0}</Label>
                        </Button>
                        <Button iconLeft transparent style={styles.footerButton}>
                            <Icon active name='ios-undo' style={styles.footerIcon} />
                            {this._renderReplyIcon(item, 'post')}
                        </Button>
                    </Left>
                </CardItem>
            );
        }
    }

    _renderUserPetitionFooter (item) {
        // console.log(item.entity.type ? item.entity.type : '==================');
        // console.log(item);
        let isSigned = item.user_petition.is_subscribed;
        // console.log(item);
        return (
            <CardItem footer style={{ height: 35 }}>
                <Left style={{ justifyContent: 'flex-end' }}>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon name='md-arrow-dropdown' style={styles.footerIcon} />
                        <Label style={styles.footerText} onPress={() => this.sign(item)} > {isSigned ? 'Sign' : 'Unsign'}</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='ios-undo' style={styles.footerIcon} />
                        {this._renderReplyIcon(item, 'petition')}
                    </Button>
                </Left>
            </CardItem>
        );
    }
    _renderLeaderPetitionFooter (item) {
        // console.log(item.entity.type ? item.entity.type : '==================');
        // console.log(item);
        let isSigned = item.poll.is_subscribed;
        // console.log(item);
        return (
            <CardItem footer style={{ height: 35 }}>
                <Left style={{ justifyContent: 'flex-end' }}>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon name='md-arrow-dropdown' style={styles.footerIcon} />
                        <Label style={styles.footerText} onPress={() => this.sign(item)} > {isSigned ? 'Sign' : 'Unsign'}</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='ios-undo' style={styles.footerIcon} />
                        {this._renderReplyIcon(item, 'petition')}
                    </Button>
                </Left>
            </CardItem>
        );
    }

    _renderQuestionFooter (item) {
        // console.log(item.entity.type ? item.entity.type : '==================');

        return (
            <CardItem footer style={{ height: 35 }}>
                <Left style={{ justifyContent: 'flex-end' }}>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon name='md-arrow-dropdown' style={styles.footerIcon} />
                        <Label style={styles.footerText}>Answer</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='ios-undo' style={styles.footerIcon} />
                        {this._renderReplyIcon(item, 'poll')}
                    </Button>
                </Left>
            </CardItem>
        );
    }

    _renderPaymentRequestFooter (item) {
        // console.log(item.entity.type ? item.entity.type : '==================');

        return (
            <CardItem footer style={{ height: 35 }}>
                <Left style={{ justifyContent: 'flex-end' }}>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon name='md-arrow-dropdown' style={styles.footerIcon} />
                        <Label style={styles.footerText}>Pay</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='ios-undo' style={styles.footerIcon} />
                        {this._renderReplyIcon(item, 'poll')}
                    </Button>
                </Left>
            </CardItem>
        );
    }

    _renderLeaderEventFooter (item) {
        // console.log(item.entity.type ? item.entity.type : '==================');
        return (
            <CardItem footer style={{ height: 35 }}>
                <Left style={{ justifyContent: 'flex-end' }}>
                    <Button iconLeft transparent style={styles.footerButton} onPress={() => Actions.itemDetail({entityType: 'poll', entityId: item.id})} >
                        <Icon name='md-arrow-dropdown' style={styles.footerIcon} />
                        <Label style={styles.footerText}>RSVP</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='ios-undo' style={styles.footerIcon} />
                        {this._renderReplyIcon(item, 'poll')}
                    </Button>
                </Left>
            </CardItem>
        );
    }

    _renderLeadNewsFooter (item) {
        // console.log(item.entity.type ? item.entity.type : '==================');

        // console.log(item.description);
        return (
            <CardItem footer style={{ height: 35 }}>
                <Left style={{ justifyContent: 'flex-end' }}>
                    <Button iconLeft transparent style={styles.footerButton} onPress={() => Actions.itemDetail({entityType: 'post', entityId: item.id})} >
                        <Icon name='md-arrow-dropdown' style={styles.footerIcon} />
                        <Label style={styles.footerText}>Discuss</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='ios-undo' style={styles.footerIcon} />
                        {this._renderReplyIcon(item, 'post')}
                    </Button>
                </Left>
            </CardItem>
        );
    }

    _renderDefaultFooter (item) {
        // console.log(item.entity.type ? item.entity.type : '==================');

        return (
            <CardItem footer style={{ height: 35 }}>
                {/* <Left style={{ justifyContent: 'flex-end' }}>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon name='md-arrow-dropup' style={styles.footerIcon} />
                        <Label style={styles.footerText}>Upvote {item.rate_up ? item.rate_up : 0}</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='md-arrow-dropdown' style={styles.footerIcon} />
                        <Label style={styles.footerText}>Downvote {item.rate_up ? item.rate_down : 0}</Label>
                    </Button>
                    <Button iconLeft transparent style={styles.footerButton}>
                        <Icon active name='ios-undo' style={styles.footerIcon} />
                        {this._renderReplyIcon(item, 'post')}
                    </Button> */}
                {/* </Left> */}
            </CardItem>
        );
    }

    // Button options are different depending on the item
    /// /Post = Upvote, Downvote, Reply
    // Petition = Sign, Reply... for user petitions and group petitions
    // Group Poll (aka question) = Answer, Reply
    // Group Fundraiser (aka payment_request)= Donate, Reply
    // Group Discussion (leader_news) = Reply
    // Group Event (leader_event) = RSVP, Reply
    // If we are viewing the item in Item Detail Screen, an added button Analytics appears for Posts.

    render () {
        let {item} = this.state;
        // console.log(item.entity);
        switch (item.entity.type) {
        case 'post':
            return this._renderPostFooter(item);
        case 'user-petition':
            return this._renderUserPetitionFooter(item);
        case 'petition':
            return this._renderLeaderPetitionFooter(item);
        case 'question':
            return this._renderQuestionFooter(item);
        case 'payment-request':
            return;
        case 'leader-event':
            return this._renderLeaderEventFooter(item);
        case 'leader-news':
            return this._renderLeadNewsFooter(item);
        default:
            return this._renderDefaultFooter(item);
        }
    }
}

export default FeedFooter;
