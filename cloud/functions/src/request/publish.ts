import * as functions from 'firebase-functions';

import * as cors from 'cors';

import {verifyToken} from './utils/request-utils';

import {ScheduledPublishTask, schedulePublish} from './publish/schedule-publish-task';

export async function publishTask(request: functions.Request, response: functions.Response<any>) {
  const corsHandler = cors({origin: true});

  corsHandler(request, response, async () => {
    const validToken: boolean = await verifyToken(request);

    if (!validToken) {
      response.status(400).json({
        error: 'Not Authorized.',
      });
      return;
    }

    try {
      const scheduledTask: ScheduledPublishTask = await schedulePublish(request);

      response.json(scheduledTask);
    } catch (err) {
      response.status(500).json({
        error: err,
      });
    }
  });
}
