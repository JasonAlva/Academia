from langchain_core.messages import BaseMessage
import operator
from typing import TypedDict,Annotated

class AgentState(TypedDict):
    messages:Annotated[list[BaseMessage],operator.add]