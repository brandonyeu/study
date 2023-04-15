import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { saveTrialAnswer, useNextStep } from "../store";
import { useCurrentStep } from "../routes";
import { useNavigate, useParams } from "react-router-dom";

const PREFIX = "@REVISIT_COMMS";

const defaultStyle = {
  height: "300px",
  width: "100%",
  border: 0,
};

const IframeController = ({
  path,
  style = {},
}: {
  path?: string;
  style?: { [key: string]: any };
}) => {
  const iframeStyle = { ...defaultStyle, ...style };

  const dispatch = useDispatch();

  const iframeId = useMemo(() => crypto.randomUUID(), []);
  const { trialId = null } = useParams<{ trialId: string }>();

  // navigation
  const currentStep = useCurrentStep();
  const navigate = useNavigate();
  const computedTo = useNextStep();

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (
        typeof data === "object" &&
        "type" in data &&
        data.type.substring(0, PREFIX.length) === PREFIX &&
        data.iframeId === iframeId &&
        trialId
      ) {
        switch (data.type) {
          case `${PREFIX}/ANSWERS`:
            dispatch(
              saveTrialAnswer({
                trialName: currentStep,
                trialId,
                answer: data.message as object,
              })
            );

            navigate(`/${computedTo}`, { replace: false });
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("message", handler);

    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div>
      <iframe
        src={`/html-stimuli/${path}?id=${iframeId}`}
        style={iframeStyle}
      ></iframe>
    </div>
  );
};

export default IframeController;
