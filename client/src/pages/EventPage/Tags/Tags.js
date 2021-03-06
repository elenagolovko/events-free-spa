/**
 * Component show tags on event's page and allow to check them on admin's
 */

import React, { Component } from "react";
import PropTypes from "prop-types";

import Tag from "../../../components/Tag/Tag";

import axios from "axios";
import { API } from "constants/config";

import './Tags.scss';


const propTypes = {
  tags: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  routerHistory: PropTypes.object.isRequired,
  adminMode: PropTypes.bool,
  // unconfirmedTags: PropTypes.array.isRequired
};

class Tags extends Component {

  state = {
    tags: this.props.tags,
    newTag: '',
    predictions: {},
  }

  componentDidMount() {
    this.predict(this.props.id);
  }

  async predict(id) {
    try {
      const data = await axios.get(`${API}/event-tag-predict`, {
        params: {
          id
        }
      });

      const { topics, tags } = data.data;

      this.setState({
        predictions: {
          topics,
          tags
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  saveTags = async () => {
    try {
      await axios.patch(`${API}/event-tag`, {
        id: this.props.id,
        tags: this.state.tags
      });

      this.props.routerHistory.push("/somepath");
    } catch (error) {
      console.log(error);
    }
  };

  handleChange = event => {
    const { value } = event.target;

    this.setState({ newTag: value });
  };

  handleClick = () => {
    // const { tags, newTag } = this.state;
    // const tags = [ ...this.state.tags ];
    // tags.push(newTag);

    if (this.state.newTag) {
      this.setState({
        tags: [...this.state.tags, ...this.state.newTag.split(' ')], // check dyplicates
        newTag: ''
      })

    }
  };

  renderPredictionTags() {

    function renderTags (items) {
      return items.map((item, i) => {
        const { label, probability } = item;
        return (
          <div>
            <Tag key={i} text={label} />
            <p>{probability}%</p>
          </div>
        );
      })
    }

    const { tags, topics } = this.state.predictions;

    return (
      <div className="predictions">
        <div>
          <h5>Tags</h5>
          {renderTags(tags)}
        </div>
        <div>
          <h5>Topics</h5>
          {renderTags(topics)}
        </div>
      </div>
    );

  }

  render() {
    if (!this.props.adminMode) {
      return (
        <div className="tag__container">
          {this.props.tags.map((item, i) => {
            return <Tag key={i} text={item} />;
          })}
        </div>
      );
    }

    return (
      <div className="tags">
        {this.state.tags.map((item, i) => {
          return <Tag key={i} text={item} />;
        })}

        {Object.keys(this.state.predictions).length && this.renderPredictionTags()}

        <input
          type="text"
          value={this.state.newTag}
          onChange={this.handleChange}
        />

        {/* TODO: use common components */}

        <button onClick={this.handleClick}>Добавить</button>
        <button onClick={this.saveTags}>Сохранить</button>
      </div>
    );
  }
}

Tags.propTypes = propTypes;

export default Tags;
