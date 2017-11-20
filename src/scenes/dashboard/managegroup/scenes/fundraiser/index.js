import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
    Container,
    Content,
    Header,
    Body,
    Title,
    Card,
    Left,
    Right,
    Label,
    Thumbnail,
    Item,
    List,
    ListItem,
    Input,
    Button,
    Icon,
    Form,
    Spinner,
    Text
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import styles from './styles';
import Stripe from 'tipsi-stripe';
import { connect } from 'react-redux';
import PLBankAccount from '../../../../../common/PLBankAccount';
import { groupGetBankAccounts, groupCreateBankAccount, groupDeleteBankAccount } from 'PLActions';

class GroupBankAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            createNewOne: false
        };
        this.onSave = this.onSave.bind(this);
        this.renderAccountsOrForm = this.renderAccountsOrForm.bind(this);
        this.renderPlusSign = this.renderPlusSign.bind(this);
        this.showForm = this.showForm.bind(this);
    }

    componentDidMount() {
        const { group, getGroupAccounts } = this.props;
        getGroupAccounts(group.id);
    }

    onSave(params) {
        const { group, createGroupAccounts } = this.props;
        createGroupAccounts(group.id, params);    
    }   

    listBankAccounts(array) {
        return array.map((item, index) => {
            return (
                <List key={index}>
                    <Item>
                        <Card>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <View style={{flex: 2}}>
                                    <View style={componentStyles.listItemStyle}>
                                        <Label>Bank</Label>
                                        <Text>{item.bank_name}</Text>
                                    </View>
                                    <View style={componentStyles.listItemStyle}>
                                        <Label>Last 4 Digits</Label>
                                        <Text>{item.last4}</Text>
                                    </View>
                                </View>
                                <View style={{flex: 1}}>
                                    <TouchableOpacity style={[componentStyles.listItemStyle, {alignItems: 'center'}]} onPress={() => this.props.deleteGroupAccounts(this.props.group.id, item.id)}>
                                        <Icon name='trash' size={50} />
                                        <Text style={{textAlign: 'center', fontSize: 12, color: 'grey'}}>Delete Account</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Card>
                    </Item>
                </List>
            );
        });
    }

    renderAccountsOrForm() {
        if(!this.props.loading) {
            if(this.props.accounts && this.props.accounts.length >= 1 && !this.state.createNewOne) {
                return this.listBankAccounts(this.props.accounts);
            } else {
                return ( <PLBankAccount onSave={this.onSave} /> );
            }
        } else {
            return (
                <Spinner color='blue' />
            );
        }
    }

    showForm() {
        if(this.state.createNewOne) {
            this.setState({createNewOne: false});
        } else {
            this.setState({createNewOne: true});
        }
    }

    renderPlusSign() {
        if(this.props.accounts && this.props.accounts.length >= 1) {
            return (
                <Right>
                    <TouchableOpacity onPress={this.showForm}>
                        <Icon name='plus' size={40} />
                    </TouchableOpacity>
                </Right>
            );
        } 
    }
    
    render() {
        return (
            <Container style={styles.container}>
                <Header style={styles.header}>
                    <Left>
                        <Button transparent onPress={() => Actions.pop({type: 'reset'})}>
                            <Icon active name='arrow-back' style={{ color: 'white' }} />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={{ color: 'white' }}>Bank Account</Title>
                    </Body>
                    {this.renderPlusSign()}
                </Header>
                <Content padder >
                    {this.renderAccountsOrForm()}
                </Content>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    accounts: state.groupManagement.bankAccounts,
    loading: state.groupManagement.bankAccountsLoading
});

const mapDispatchToProps = (dispatch) => ({
    getGroupAccounts: (groupId) => dispatch(groupGetBankAccounts(groupId)),
    createGroupAccounts: (groupId, body) => dispatch(groupCreateBankAccount(groupId, body)),
    deleteGroupAccounts: (groupId, accountId) => dispatch(groupDeleteBankAccount(groupId, accountId)),
});
const componentStyles = {
    listItemStyle: {
        margin: 20
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupBankAccount);
