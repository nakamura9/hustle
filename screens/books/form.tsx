import React from 'react';
import {
  ScrollView,
  Alert,
  Text,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import axios from 'axios';
import constants from '../../constants';
import DataField from '../../components/books/data';
import DateField from '../../components/books/date';
import BooleanField from '../../components/books/boolean';
import LinkField from '../../components/books/link';
import NumberField from '../../components/books/number';
import TextField from '../../components/books/text';
import DynamicLinkField from '../../components/books/dynamic_link';
import Loading from '../../components/loading';
import TableField from '../../components/books/table';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSave} from '@fortawesome/free-solid-svg-icons';
import colors from '../../styles/colors';
import {background, text} from '../../styles/text';
import {iconColor} from '../../styles/inputs';
import frappe from '../../scripts/frappe';
import { randomID } from '../../components/books/table';

const renderField = (field, data, setData, doctype) => {
  let renderedField;
  const submitted = data.docstatus && data.docstatus == 1
  const props = {
    fieldtype: field.fieldtype,
    formData: data,
    fieldname: field.fieldname,
    options: field.options,
    hidden: field.hidden,
    mandatory: field.mandatory,
    label: field.label,
    read_only: field.read_only || submitted,
    isInput: true,
    value: data[field.fieldname] || null,
    onChange: val => {
      const newData = {...data};
      newData[field.fieldname] = val;
      setData(newData);
    },
  };
  switch (field.fieldtype) {
    case 'Data':
      renderedField = <DataField {...props} />;
      break;
    case 'Date':
      renderedField = <DateField {...props} />;
      break;
    case 'Check':
      renderedField = <BooleanField {...props} />;
      break;
    case 'Link':
      renderedField = <LinkField {...props} />;
      break;
    case 'DynamicLink':
      renderedField = <DynamicLinkField {...props} />;
      break;
    case 'Int':
    case 'Float':
    case 'Currency':
      renderedField = <NumberField {...props} />;
      break;
    case 'Small Text':
    case 'Long Text':
    case 'Text':
    case 'Text Editor':
      renderedField = <TextField {...props} />;
      break;
    case 'Table':
      renderedField = <TableField {...props} />;
  }

  return renderedField;
};


const SaveSubmitButton = ({submittable, unsaved, handler, data}) => {
  const [label, setLabel] = React.useState("Save")
  const [visible, setVisible] = React.useState(true)
  React.useEffect(() => {
    console.log({submittable, unsaved})
    if(submittable) {
      if(data.docstatus > 0) {
        setVisible(false)
      } else {
        setVisible(true)
        if(!unsaved) {
          setLabel("Submit")
        } else {
          setLabel("Save")
        }
      }
    } else {
      setVisible(true)
      setLabel("Save")
    }
  }, [submittable, unsaved, data])

  if(!visible) {
    return <View />
  }

  return (
    <Pressable style={styles.button} onPress={handler}>
        <FontAwesomeIcon icon={faSave} size={24} color={'white'} />
        <Text style={{...text, color: 'white', fontSize: 24}}>{label}</Text>
      </Pressable>
  )
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      data: {},
      meta: {},
      doctype: props.route.params.doctype,
      id: ''
    };
    // frappe form
    this.fields_dict= {}
    this.script_manager = {
      trigger: (a, b, c) => {
        if (b) {
          if (frappe.ui.form.events[b] && frappe.ui.form.events[b][a]) {
            frappe.ui.form.events[b][a](window.frm, b, c);
          }
          return;
        }
        if (
          frappe.ui.form.events[this.doc.doctype] &&
          frappe.ui.form.events[this.doc.doctype][a]
        ) {
          frappe.ui.form.events[this.doc.doctype][a](window.frm);
        }
      }
    }
  }

  loadForm() {
    const params = {doctype: this.state.doctype};
    if (this.state.id) {
      params.id = this.state.id;
    }
    axios
      .get(`${constants.server_url}/api/method/erp.public_api.form`, {
        params: params,
      })
      .then(res => {
        if (res.data.message.meta) {
          const currData = {...this.state.data}
          res.data.message.meta.fields
            .filter(f => f.fieldtype == "Table")
            .forEach(f => {
              currData[f.fieldname] = []
            })
          const newData = {...currData, ...res.data.message.data}
          this.setState({
            fields: res.data.message.meta.fields,
            meta: res.data.message.meta,
            data: newData,
          });
          eval(res.data.message.script);
          if(frappe.ui.form.events[this.state.doctype].refresh) {
            frappe.ui.form.events[this.state.doctype].refresh(this)
          }
        }
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          console.log(err.response.data);
        }
      });
  }

  updateLocals() {
    const newLocals = {};
    const docname = this.state.data.name;
    newLocals[this.state.doctype] = {};
    newLocals[this.state.doctype][`${docname}`] = this.state.data;
    this.state.fields
      .filter(f => f.fieldtype == 'Table')
      .forEach(f => {
        newLocals[f.options] = {};
        (this.state.data[f.fieldname] || []).forEach(row => {
          newLocals[f.options][row.name] = row;
        });
      });

    window.locals = newLocals;
  }

  /**
   * frappe form
   */

  get doc() {
    return this.state.data
  }

  get schema() {
    return this.state.fields
  }

  setData(data) {
    if(JSON.stringify(data) != JSON.stringify(this.state.data)) {
      data.__unsaved = 1
    }
    this.setState({data: data})
  }

  set_value(fieldname, value) {
    const newData = {...this.doc};
    newData[fieldname] = value;
    newData.__unsaved = 1
    this.setData(newData);
    window.frm.doc = newData;
    this.script_manager.trigger(fieldname);
  }
  set_query(query) {}
  refresh_field(fieldname) {}
  refresh() {}
  disable_save() {}
  add_custom_button() {}
  add_child(table, child) {
    const newData = {...this.state.data}
    const rows = [...newData[table]]
    const doctype = this.state.fields.filter(f => f.fieldname == table)[0].options
    child.doctype = doctype
    child.name = `New ${doctype} ${randomID()}`
    rows.push(child)
    newData[table] = rows
    this.setState({data: newData})
  }

  set_df_property(field, property, value) {
    const newFields = [...this.state.fields]
    const newFieldIndex = this.state.fields.map(f => f.fieldname).indexOf(field)
    const newField = this.state.fields[newFieldIndex]
    newField[property] = value
    newFields[newFieldIndex] = newField
    this.setState({fields: newFields})

  }

  // End frappe form

  componentDidMount() {
    window.frappe = frappe;
    window.flt = frappe.flt;
    window.frm = this;
    window.locals = {};
    this.setState({doctype: this.props.route.params.doctype});
    this.props.navigation.setOptions({title: `New ${this.state.doctype}`});
    const newData = {...this.state.data};
    newData.__islocal = 1;
    newData.doctype = this.state.doctype;
    newData.name = `New ${this.state.doctype}`;
    this.setState({data: newData});
    this.loadForm();

    if (this.props.route.params.id) {
      this.setState({id: this.props.route.params.id});
    }
  }

  componentDidUpdate(
    prevProps: Readonly<{}>,
    prevState: Readonly<{}>,
    snapshot?: any,
  ): void {
    if (prevState.id != this.state.id && this.state.id) {
      this.props.navigation.setOptions({title: `${this.state.doctype} ${this.state.id}`});
      const newData = {...this.state.data};
      newData.name = this.state.id;
      delete newData.__islocal;
      this.setState({data: newData}, () => {
        this.loadForm();
      });
    }

    if(JSON.stringify(prevProps.route) != JSON.stringify(this.props.route)) {
      this.setState({id: this.props.route.params.id});
    }

    if (JSON.stringify(this.state.data) != JSON.stringify(prevState.data)) {
      this.onDataUpdate(prevState.data);
    }

    const contentDiff = JSON.stringify(this.state.data) != JSON.stringify(prevState.data)
    const keyLengthDiff = Object.keys(this.state.data).length == Object.keys(prevState.data).length
    if (contentDiff && keyLengthDiff && this.state.data.__unsaved != 1) {
      const newData = {...this.state.data}
      newData.__unsaved = 1
      this.setState({data: newData})
    }
  }

  onDataUpdate(prevData) {
    this.updateLocals();
    // for initial state of form
    if (!window.frm) {
      return;
    }

    // HACKY -- replaced by class based app
    // window.frm.doc = data

    // trigger events when data changes.
    let val;
    let field;
    const dataFields = Array.from(Object.keys(this.state.data));
    for (let f of dataFields) {
      if (JSON.stringify(this.state.data[f]) != JSON.stringify(prevData[f])) {
        val = this.state.data[f];
        field = this.state.fields.filter(g => g.fieldname == f)[0];
        break;
      }
    }
    if (!field) {
      return;
    }

    if (val instanceof Array) {
      if (
        !prevData[field.fieldname] ||
        prevData[field.fieldname].length != val.length
      ) {
        // adding or removing a row, return
        return;
      }
      // find diff
      val.forEach((row, i) => {
        const oldRow = prevData[field.fieldname][i];
        Object.keys(row).forEach(k => {
          if (oldRow[k] != row[k]) {
            frm.script_manager.trigger(k, field.options, row.name);
          }
        });
      });
    } else {
      frm.script_manager.trigger(field.fieldname);
    }
  }

  saveDocument = () => {
    // post form to remote server
    axios
      .post(`${constants.server_url}/api/method/erp.public_api.form`, {
        doctype: this.state.doctype,
        args: {...this.state.data, doctype: this.state.doctype},
      })
      .then(res => {
        if (res.data.message) {
          Alert.alert(
            'Success',
            `Saved ${this.state.doctype} ${res.data.message} successfully`,
          );
          this.props.navigation.navigate('List', {doctype: this.state.doctype});
        }
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          JSON.parse(err.response.data._server_messages).forEach(m => {
            const msg = JSON.parse(m)
            Alert.alert(msg.title, msg.message)
          })
        }
      });
  }

  render() {
    if (!this.state.fields || this.state.fields.length < 1) {
      return <Loading />;
    }

    return (
      <ScrollView style={{backgroundColor: background.color}}>
        {this.state.fields.map(f =>
          renderField(
            f,
            this.state.data,
            newData => this.setState({data: newData}),
            this.state.doctype,
          ),
        )}
        <View style={styles.footer}>
          <SaveSubmitButton
            submittable={this.state.meta && this.state.meta.is_submittable}
            unsaved={this.state.data.__unsaved}
            handler={this.saveDocument}
            data={this.state.data}
          />
        </View>
      </ScrollView>
    );
  }
}

export default function FormScreen({navigation, route}) {
  return <Form navigation={navigation} route={route} />;
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    margin: 12,
    width: 140,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    
  },
});
