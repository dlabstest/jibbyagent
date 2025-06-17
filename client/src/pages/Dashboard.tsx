import React from 'react';
import { Paper, Typography, Box, Card, CardContent, styled } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  Message as MessageIcon,
  Phone as PhoneIcon,
  PersonAdd as PersonAddIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { BarDatum, ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

// Create a styled Grid component with the correct props for Material-UI v5
const GridContainer = styled('div')({
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(12, 1fr)',
  width: '100%',
});

const GridItem = styled('div')(({ theme }) => ({
  gridColumn: 'span 12',
  [theme.breakpoints.up('sm')]: {
    gridColumn: 'span 6',
  },
  [theme.breakpoints.up('md')]: {
    gridColumn: 'span 3',
  },
}));

const GridItemLarge = styled('div')(({ theme }) => ({
  gridColumn: 'span 12',
  [theme.breakpoints.up('md')]: {
    gridColumn: 'span 6',
  },
}));

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

interface ActivityData {
  day: string;
  messages: number;
  calls: number;
}

interface ChannelData {
  id: string;
  label: string;
  value: number;
}



// Mock data for charts
const activityData: BarDatum[] = [
  { day: 'Mon', messages: 120, calls: 80 },
  { day: 'Tue', messages: 90, calls: 70 },
  { day: 'Wed', messages: 150, calls: 110 },
  { day: 'Thu', messages: 140, calls: 90 },
  { day: 'Fri', messages: 200, calls: 130 },
  { day: 'Sat', messages: 80, calls: 50 },
  { day: 'Sun', messages: 60, calls: 40 },
];

const channelData = [
  { id: 'WhatsApp', label: 'WhatsApp', value: 65 },
  { id: 'Voice', label: 'Voice', value: 25 },
  { id: 'Email', label: 'Email', value: 10 },
];

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          <Icon fontSize="large" />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <GridContainer>
          <GridItem>
            <StatCard
              title="Total Messages"
              value="1,234"
              icon={MessageIcon}
              color="#1976d2"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="Total Calls"
              value="567"
              icon={PhoneIcon}
              color="#9c27b0"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="New Leads"
              value="89"
              icon={PersonAddIcon}
              color="#2e7d32"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="Response Rate"
              value="92%"
              icon={TimelineIcon}
              color="#ed6c02"
            />
          </GridItem>
        </GridContainer>
      </Box>

      {/* Charts */}
      <GridContainer>
        <GridItemLarge>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Activity Overview
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveBar
                data={activityData}
                keys={['messages', 'calls']}
                indexBy="day"
                margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['#1976d2', '#9c27b0']}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Day of Week',
                  legendPosition: 'middle',
                  legendOffset: 40,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Count',
                  legendPosition: 'middle',
                  legendOffset: -50,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#fff"
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 12,
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
                animate={true}
                motionConfig="default"
              />
            </Box>
          </Paper>
        </GridItemLarge>
        <GridItemLarge>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Channel Distribution
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsivePie
                data={channelData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#ffffff"
                colors={['#1976d2', '#9c27b0', '#2e7d32']}
                defs={[
                  {
                    id: 'dots',
                    type: 'patternDots',
                    background: 'inherit',
                    color: 'rgba(255, 255, 255, 0.3)',
                    size: 4,
                    padding: 1,
                    stagger: true,
                  },
                ]}
                fill={[
                  {
                    match: {
                      id: 'ruby',
                    },
                    id: 'dots',
                  },
                ]}
              />
            </Box>
          </Paper>
        </GridItemLarge>
      </GridContainer>

      {/* Recent Activity */}
      <Box sx={{ mt: 2 }}>
        <GridContainer>
          <div style={{ gridColumn: 'span 12' }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {/* Add recent activity list here */}
            </Paper>
          </div>
        </GridContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;
