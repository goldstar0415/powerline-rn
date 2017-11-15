import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import Stripe, {PaymentCardTextField} from 'tipsi-stripe'
import {
    Container,
    Content,
    Header,
    Body,
    Title,
    Left,
    Right,
    Label,
    Thumbnail,
    Spinner,
    Item,
    List,
    ListItem,
    Input,
    Card,
    Button,
    Icon,
    Form,
    Text,
    Picker
} from 'native-base';
import PLColors from 'PLColors'

class PLAddCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addressLine1: (props.user.address1 ? `${props.user.address1}` : ''),
            addressLine2: (props.user.address2 ? `${props.user.address2}` : ''),
            name: (props.user.full_name ? `${props.user.full_name}` : ''),
            addressCity: (props.user.city ? `${props.user.city}` : ''),
            addressState: (props.user.state ? `${props.user.state}` : ''),
            addressZip: (props.user.zip ? `${props.user.zip}` : ''),
            addressCountry: (props.user.country ? `${props.user.country}` : ''),
            phone: (props.user.phone ? `${props.user.phone}` : ''),
            email: (props.user.email ? `${props.user.email}` : ''),
            expYear: null,
            expMonth: null,
            cvc: null,
            number: null,
            addressCity: (props.user.city ? `${props.user.city}` : ''),
            currency: 'USD',
            cardValid: false
        }
        // this.openCardForm = this.openCardForm.bind(this);
    }

    inputChanged(key, prop) {
        this.setState(state => {
            state[key] = prop;
            return state;
        })

    }

    handleFieldParamsChange = (valid, params) => {
        const number = params.number || '-'
        const expMonth = params.expMonth || '-'
        const expYear = params.expYear || '-'
        const cvc = params.cvc || '-'
        this.setState({
            number,
            expMonth,
            expYear,
            cvc,
            cardValid: valid
        })
      }
      
      save({name, number, addressLine1, addressLine2, addressCity, addressCountry, addressState, addressZip, expMonth, expYear, cvc, currency}) {
    
        const options = {
            number, 
            addressLine1, 
            addressLine2,
            expMonth,
            expYear,
            addressCity,
            addressState,
            addressZip,
            addressCountry,
            cvc,
            name,
            currency
        }
        Stripe.createTokenWithCard(options)
            .then(response => this.props.onSave(response))
            .catch(err => console.log(err))
      }
      render() {
        return (
            <Card style={{padding: 10}}>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>Credit Card</Text> 
                    <View style={{borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,  borderRadius: 25}}>
                        <PaymentCardTextField style={{borderColor: 'black'}} onParamsChange={this.handleFieldParamsChange} />
                    </View>
                </View>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>Country</Text> 
                    <View style={{borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,  borderRadius: 25}}>
                        <Picker 
                            placeholder='Country'
                            iosHeader="Country"
                            mode="dropdown"
                            selectedValue={this.state.addressCountry}
                            onValueChange={value => {
                                this.inputChanged('addressCountry', value)
                            }}
                        >
                            <Item label="United States" value='US'/>
                        </Picker>
                    </View>
                </View>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>Full Name</Text> 
                    <Item rounded>
                        <Input placeholder='Name' value={this.state.name} onChangeText={text => this.inputChanged('name', text)}/>
                    </Item>
                </View>

                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>Address Line 1</Text> 
                    <Item rounded>
                        <Input placeholder='St.' value={this.state.addressLine1} onChangeText={text => this.inputChanged('addressLine1', text)}/>
                    </Item>
                </View>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>Address Line 2</Text> 
                    <Item rounded>
                        <Input placeholder='Apt. x' value={this.state.addressLine2} onChangeText={text => this.inputChanged('addressLine2', text)}/>
                    </Item>
                </View>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>City</Text> 
                    <Item rounded>
                        <Input placeholder='City' value={this.state.addressCity} onChangeText={text => this.inputChanged('addressCity', text)}/>
                    </Item>
                </View>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>State</Text> 
                    <Item rounded>
                        <Input placeholder='State' value={this.state.addressState} onChangeText={text => this.inputChanged('addressState', text)}/>
                    </Item>
                </View>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>Phone</Text> 
                    <Item rounded>
                        <Input placeholder='12345678' value={this.state.phone} onChangeText={text => this.inputChanged('phone', text)}/>
                    </Item>
                </View>
                <View style={{marginVertical: 5}}>
                    <Text style={styles.labelStyle}>Postalcode</Text> 
                    <Item rounded>
                        <Input placeholder='12345' value={this.state.addressZip} onChangeText={text => this.inputChanged('addressZip', text)}/>
                    </Item>
                </View>
                <Button block style={styles.submitButtonContainer} onPress={() => this.save(this.state)}>
                    <Label style={{color: 'white'}}>Save</Label>
                </Button>
            </Card>
        )
    }
}
const styles = {
    submitButtonContainer: {
        backgroundColor: PLColors.main,
        marginTop: 20,
        marginBottom: 12
    },
    labelStyle: {
        fontSize: 12, 
        color: 'grey', 
        marginLeft: 5,
        marginVertical: 5
    }
}

const mapStateToProps = (state) => ({
    user: state.user.profile
})
export default connect(mapStateToProps)(PLAddCard)