import React, { Component, PropTypes } from 'react';

import {
  Container,
  Content,
  Header,
  Body,
  Title,
  Left,
  Right,
  Thumbnail,
  List,
  ListItem,
  Button,
  Icon,
  Label as NSLabel,
  CheckBox
} from 'native-base';
import { View, Text } from 'react-native';
import { loadGroupPermissions, updateGroupPermissions } from 'PLActions';

import { Label, Input, PopupLabel, CheckBoxItem } from '../components';
import styles from '../styles';

const permissionsLabels = {
  "permissions_name": "Name",
  "permissions_address": "Street Address",
  "permissions_city": "City",
  "permissions_state": "State",
  "permissions_country": "Country",
  "permissions_zip_code": "Zip Code",
  "permissions_email": "Email",
  "permissions_phone": "Phone Number",
  "permissions_responses": "Responses"
};

function _map(obj, cb) {
  return Object.keys(obj).map(key => cb(key, obj[key], permissionsLabels[key]));
}

class GroupPermissions extends Component {
  static propTypes = {
    groupId: PropTypes.number,
    isOwnerManager: PropTypes.bool,
  };

  state = {
    permissions: {}
  };

  async componentDidMount() {
    const { token, dispatch, groupId } = this.props;
    const permissions = await loadGroupPermissions(token, groupId);

    this.setState({ permissions });
  }

  setPermission = pId => {
    this.setState({
      permissions: {
        ...this.state.permissions,
        [pId]: !this.state.permissions[pId]
      }
    })
  }

  savePermissions = () => {
    const { dispatch, token, groupId } = this.props;
    const permissions = _map(this.state.permissions, (pId, value) =>  ({ pId, value }));
    const permissionsArray = permissions.reduce((result, perm) => {
      if (perm.value) {
        return result.concat(perm.pId);
      }

      return result;
    }, []);
    
    dispatch(updateGroupPermissions(token, groupId, permissionsArray));
  }

  render() {
    return (
      <View>
        {
          _map(this.state.permissions, (pId, value, name) => (
            <CheckBoxItem
              disabled={!this.props.isOwnerManager}
              checked={value}
              title={name}
              onPress={() => this.setPermission(pId)}
            />
          ))
        }
        {
          this.props.isOwnerManager &&
          <Button block style={styles.submitButtonContainer} onPress={this.savePermissions}>
            <NSLabel style={styles.submitButtonText}>Save</NSLabel>
          </Button>
        }
      </View>
    );
  }
}

export default GroupPermissions;