import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import { grey300, yellow500 } from 'material-ui/styles/colors';
import LightbulbIcon from 'material-ui/svg-icons/action/lightbulb-outline';
import React from 'react';
import PageHeader from './PageHeader';

const LightbulbDetail = ({
  humidity,
  isOn,
  name,
  serialNumber,
  temperature,
}) => (
  <div>
    <PageHeader title={name} subtitle={serialNumber} />
    <div className="container container--small container--space">
      <Paper className="card card--bulb card--small">
        <Avatar size={124} backgroundColor={isOn ? yellow500 : grey300}>
          <LightbulbIcon style={{ height: 84, width: 84 }} />
        </Avatar>
        <p className="card__text--button">
          Turn { isOn ? 'OFF' : 'ON'}
        </p>
      </Paper>
      <Paper className="card card--small card--temp">
        <h3 className="card__text--value">
          {temperature ? `${temperature}°F` : '--'}
        </h3>
        <p className="card__text--label">Current Temperature</p>
      </Paper>
      <Paper className="card card--small card--humidity">
        <h3 className="card__text--value">
          {humidity ? `${humidity}%` : '--'}
        </h3>
        <p className="card__text--label">Current Humidity</p>
      </Paper>
    </div>
  </div>
);

LightbulbDetail.propTypes = {
  humidity: React.PropTypes.number.isRequired,
  isOn: React.PropTypes.bool.isRequired,
  name: React.PropTypes.string.isRequired,
  serialNumber: React.PropTypes.string.isRequired,
  temperature: React.PropTypes.number.isRequired,
};

export default LightbulbDetail;
